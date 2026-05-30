<?php

namespace App\Http\Controllers;

use App\Models\Conflict;
use App\Models\Schedule;
use App\Models\Room;
use App\Models\ScheduleVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ConflictController extends Controller
{
    public function index()
    {
        $total = Conflict::count();
        $unresolved = Conflict::where('status', 'Unresolved')->count();
        $resolved = Conflict::where('status', 'Resolved')->count();
        $activeVersion = ScheduleVersion::where('status', 'Active')->first();
        // ANALYSIS FORMULAS (No hardcoding)
        $successRate = $total > 0 ? round(($resolved / $total) * 100, 2) : 0;

        $autoCount = Conflict::where('resolution_method', 'Auto')->count();
        $manualCount = Conflict::where('resolution_method', 'Manual')->count();

        $analysis = [
            'success_rate' => $successRate,
            'auto_vs_manual' => [
                'auto' => $total > 0 ? round(($autoCount / $total) * 100) : 0,
                'manual' => $total > 0 ? round(($manualCount / $total) * 100) : 0,
            ],
            'patterns' => Conflict::selectRaw('conflict_type, count(*) as count')
                ->groupBy('conflict_type')
                ->get()
        ];

        return Inertia::render('Conflicts/Detection', [
            'activeVersion' => $activeVersion,
            'stats' => [
                'total' => $total,
                'unresolved' => $unresolved,
                'resolved' => $resolved
            ],
            'unresolvedList' => Conflict::with(['scheduleA.teacher', 'scheduleA.room', 'scheduleB.teacher', 'scheduleB.room'])
                ->where('status', 'Unresolved')->get(),
            'resolvedList' => Conflict::with(['scheduleA.teacher', 'scheduleB.teacher'])
                ->where('status', 'Resolved')->get(),
            'analysis' => $analysis
        ]);
    }

    public function scan()
    {
        // Get active schedule version
        $activeVersion = \App\Models\ScheduleVersion::where(
            'status',
            'Active'
        )->first();

        if (!$activeVersion) {
            return back()->with(
                'message',
                'No active schedule version found.'
            );
        }

        // Remove old unresolved conflicts
        Conflict::where('status', 'Unresolved')->delete();

        // ONLY SCAN ACTIVE VERSION
        $schedules = Schedule::where(
            'schedule_version_id',
            $activeVersion->id
        )->get();

        $newConflicts = 0;

        foreach ($schedules as $s1) {

            foreach ($schedules as $s2) {

                if ($s1->id >= $s2->id) {
                    continue;
                }

                $isSameTime =
                    $s1->timeslot_id == $s2->timeslot_id &&
                    $s1->day == $s2->day;

                if (!$isSameTime) {
                    continue;
                }

                /*
            |--------------------------------------------------------------------------
            | ROOM CLASH
            |--------------------------------------------------------------------------
            */
                if ($s1->room_id == $s2->room_id) {

                    $yearA = $s1->section->year_level;
                    $yearB = $s2->section->year_level;

                    $isAllowedSharing =
                        ($yearA == 1 && in_array($yearB, [2, 3, 4])) ||
                        ($yearB == 1 && in_array($yearA, [2, 3, 4]));

                    if (!$isAllowedSharing) {

                        Conflict::create([
                            'schedule_id_a' => $s1->id,
                            'schedule_id_b' => $s2->id,
                            'conflict_type' => 'Room Clash',
                        ]);

                        $newConflicts++;
                    }
                }

                /*
            |--------------------------------------------------------------------------
            | TEACHER OVERLAP
            |--------------------------------------------------------------------------
            */
                if ($s1->teacher_id == $s2->teacher_id) {

                    Conflict::create([
                        'schedule_id_a' => $s1->id,
                        'schedule_id_b' => $s2->id,
                        'conflict_type' => 'Teacher Overlap',
                    ]);

                    $newConflicts++;
                }

                /*
            |--------------------------------------------------------------------------
            | SECTION DOUBLE BOOK
            |--------------------------------------------------------------------------
            */
                if ($s1->section_id == $s2->section_id) {

                    Conflict::create([
                        'schedule_id_a' => $s1->id,
                        'schedule_id_b' => $s2->id,
                        'conflict_type' => 'Section Double-Book',
                    ]);

                    $newConflicts++;
                }
            }
        }

        return back()->with(
            'message',
            "Scan complete. Found {$newConflicts} conflicts in {$activeVersion->name}."
        );
    }
    public function autoResolve()
    {
        $activeVersion = \App\Models\ScheduleVersion::where(
            'status',
            'Active'
        )->first();

        if (!$activeVersion) {
            return back()->with(
                'message',
                'No active schedule version found.'
            );
        }

        $conflicts = Conflict::with([
            'scheduleA',
            'scheduleB'
        ])
            ->where('status', 'Unresolved')
            ->get()
            ->filter(function ($conflict) use ($activeVersion) {

                return
                    $conflict->scheduleA &&
                    $conflict->scheduleB &&
                    $conflict->scheduleA->schedule_version_id == $activeVersion->id &&
                    $conflict->scheduleB->schedule_version_id == $activeVersion->id;
            });

        $resolvedCount = 0;

        foreach ($conflicts as $conflict) {

            /*
            |--------------------------------------------------------------------------
            | ROOM CLASH AUTO FIX
            |--------------------------------------------------------------------------
            */

            if ($conflict->conflict_type === 'Room Clash') {

                $occupiedRooms = Schedule::where(
                    'schedule_version_id',
                    $activeVersion->id
                )
                    ->where(
                        'timeslot_id',
                        $conflict->scheduleA->timeslot_id
                    )
                    ->where(
                        'day',
                        $conflict->scheduleA->day
                    )
                    ->pluck('room_id');

                $newRoom = Room::whereNotIn(
                    'id',
                    $occupiedRooms
                )->first();

                if ($newRoom) {

                    $conflict->scheduleB->update([
                        'room_id' => $newRoom->id
                    ]);

                    $conflict->update([
                        'status' => 'Resolved',
                        'resolution_method' => 'Auto',
                        'resolved_at' => now(),
                    ]);

                    $resolvedCount++;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | TEACHER OVERLAP
            |--------------------------------------------------------------------------
            */

            if ($conflict->conflict_type === 'Teacher Overlap') {

                // Future enhancement:
                // move scheduleB to another free timeslot

            }

            /*
            |--------------------------------------------------------------------------
            | SECTION DOUBLE BOOK
            |--------------------------------------------------------------------------
            */

            if ($conflict->conflict_type === 'Section Double-Book') {

                // Future enhancement:
                // move scheduleB to another free timeslot

            }
        }

        return back()->with(
            'message',
            "{$resolvedCount} conflicts resolved automatically."
        );
    }
}
