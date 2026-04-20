<?php

namespace App\Services;

use App\Models\Section;
use App\Services\Scheduler\ClassUnitService;

use App\Services\CPSATService;
use App\Services\ScheduleCandidateBuilderService as ServicesScheduleCandidateBuilderService;

use App\Services\ScheduleWriterService as ServicesScheduleWriterService;

class AutoAssignService
{
    protected ClassUnitService $classUnitService;
    protected ServicesScheduleCandidateBuilderService $candidateBuilder;
    protected CPSATService $cpSatService;
    protected ServicesScheduleWriterService $writer;

    public function __construct(
        ClassUnitService $classUnitService,
        ServicesScheduleCandidateBuilderService $candidateBuilder,
        CPSATService $cpSatService,
        ServicesScheduleWriterService $writer
    ) {
        $this->classUnitService = $classUnitService;
        $this->candidateBuilder = $candidateBuilder;
        $this->cpSatService = $cpSatService;
        $this->writer = $writer;
    }

    /**
     * 🔥 MAIN FUNCTION (ONE CLICK GENERATE)
     */
    public function generateSchedule(array $sections, int $versionId)
    {
        // STEP 4: Class Units
        $classUnits = $this->classUnitService->generate($sections);

        $allCandidates = [];

        // STEP 5: Candidate Builder
        foreach ($sections as $section) {

            $sectionUnits = array_filter($classUnits, function ($unit) use ($section) {
                return $unit['section_id'] === $section->id;
            });

            $candidates = $this->candidateBuilder->build($section, $sectionUnits);

            $allCandidates = array_merge($allCandidates, $candidates);
        }

        // STEP 6: CP-SAT Optimization
        $optimized = $this->cpSatService->solve($allCandidates);

        // STEP 7: Save to DB
        $this->writer->save($optimized, $versionId, 'auto');

        return $optimized;
    }

    /**
     * KEEP THIS (optional fallback)
     */
    public function assignBestFaculty($subject)
    {
        // you can keep your old logic here if needed
    }
}
