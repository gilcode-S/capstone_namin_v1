<?php

namespace App\Services;

use Illuminate\Support\Collection;

/**
 * =========================================================
 * SECTION CAPACITY BALANCER SERVICE
 * =========================================================
 * PURPOSE:
 * ✔ Prevent impossible section overload before CP-SAT
 * ✔ Split oversized sections into Set A / B / C dynamically
 * ✔ Preserve section identity
 * ✔ Respect year-level complexity
 * ✔ Reserve timeslot buffer
 * ✔ Reduce solver bottlenecks
 *
 * IMPORTANT:
 * This does NOT create new sections.
 * It only partitions internal scheduling groups.
 *
 * NEW IMPROVEMENTS:
 * ✔ Accepts TimeSlot collection directly
 * ✔ Year-aware buffer
 * ✔ Smarter distribution (balanced chunks)
 * ✔ Avoids uneven last chunk (ex: 14/14/2)
 * ✔ Supports future 4th-year evening logic
 * =========================================================
 */
class SectionCapacityBalancerService
{
    /**
     * =====================================================
     * MAIN ENTRY
     * =====================================================
     *
     * @param Collection $units
     * @param Collection $timeslots
     * @param int $buffer
     * @return Collection
     */
    public function balance(
        Collection $units,
        Collection $timeslots,
        int $buffer = 2
    ): Collection {

        /**
         * =================================================
         * AVAILABLE SLOTS
         * =================================================
         */
        $availableTimeslots = $timeslots->count();

        if ($availableTimeslots <= 0) {
            throw new \Exception(
                "No timeslots available for balancing."
            );
        }

        logger()->debug(
            "SectionCapacityBalancer started",
            [
                'units' => $units->count(),
                'available_timeslots' => $availableTimeslots,
                'buffer' => $buffer,
            ]
        );

        /**
         * =================================================
         * GROUP BY SECTION
         * =================================================
         */
        $grouped = $units->groupBy(
            'section_id'
        );

        $balancedUnits = collect();

        /**
         * =================================================
         * PROCESS EACH SECTION
         * =================================================
         */
        foreach (
            $grouped as $sectionId => $sectionUnits
        ) {

            $sectionCount =
                $sectionUnits->count();

            /**
             * =================================================
             * YEAR LEVEL DETECTION
             * =================================================
             */
            $sampleUnit =
                $sectionUnits->first();

            $yearLevel =
                $sampleUnit?->section?->year_level ?? 1;

            /**
             * =================================================
             * YEAR-AWARE BUFFER
             * 4th year can tolerate tighter packing
             * =================================================
             */
            $dynamicBuffer =
                $yearLevel >= 4
                ? max(1, $buffer - 1)
                : $buffer;

            $maxUnitsPerSet = max(
                1,
                $availableTimeslots - $dynamicBuffer
            );

            /**
             * =================================================
             * SAFE SECTION
             * =================================================
             */
            if (
                $sectionCount <= $maxUnitsPerSet
            ) {

                foreach (
                    $sectionUnits as $unit
                ) {
                    $unit->set_type = 'A';
                    $balancedUnits->push(
                        $unit
                    );
                }

                logger()->debug(
                    "Section {$sectionId} safe",
                    [
                        'year_level' => $yearLevel,
                        'units' => $sectionCount,
                        'set_count' => 1,
                        'max_per_set' => $maxUnitsPerSet
                    ]
                );

                continue;
            }

            /**
             * =================================================
             * OVERLOADED SECTION
             * =================================================
             *
             * Instead of simple chunk(),
             * calculate balanced partition count
             *
             * Example:
             * 30 units / max 14
             * old = 14 / 14 / 2
             * new = 10 / 10 / 10
             * =================================================
             */
            $setCount = (int) ceil(
                $sectionCount / $maxUnitsPerSet
            );

            /**
             * Balanced chunk size
             */
            $idealChunkSize = (int) ceil(
                $sectionCount / $setCount
            );

            $chunks =
                $sectionUnits->chunk(
                    $idealChunkSize
                );

            logger()->warning(
                "Section {$sectionId} overloaded - splitting",
                [
                    'year_level' => $yearLevel,
                    'total_units' => $sectionCount,
                    'set_count' => $chunks->count(),
                    'ideal_chunk_size' => $idealChunkSize
                ]
            );

            /**
             * =================================================
             * ASSIGN SET TYPES
             * =================================================
             */
            foreach (
                $chunks as $index => $chunk
            ) {

                /**
                 * A, B, C, D...
                 */
                $setType =
                    chr(65 + $index);

                foreach (
                    $chunk as $unit
                ) {
                    $unit->set_type =
                        $setType;

                    /**
                     * =================================================
                     * OPTIONAL:
                     * 4TH YEAR DEFAULT EVENING
                     * =================================================
                     */
                    if (
                        ($unit->section->year_level ?? 1) >= 4
                    ) {
                        $constraints =
                            json_decode(
                                $unit->constraints,
                                true
                            ) ?? [];

                        if (
                            empty(
                                $constraints['preferred_shift']
                            )
                        ) {
                            $constraints['preferred_shift'] =
                                'evening';

                            $unit->constraints =
                                json_encode(
                                    $constraints
                                );
                        }
                    }

                    $balancedUnits->push(
                        $unit
                    );
                }

                logger()->debug(
                    "Section {$sectionId} Set {$setType}",
                    [
                        'units' => $chunk->count()
                    ]
                );
            }
        }

        /**
         * =================================================
         * FINAL REPORT
         * =================================================
         */
        logger()->debug(
            "SectionCapacityBalancer complete",
            [
                'original_units' => $units->count(),
                'balanced_units' => $balancedUnits->count(),
            ]
        );

        return $balancedUnits;
    }
}