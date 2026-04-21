<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\SectionSubjectAssignment;
use App\Models\Room;
use App\Models\TimeSlot;
use App\Models\Schedule;
use App\Models\ScheduleVersion;
use App\Models\Section;

use App\Services\Scheduler\ClassUnitService;
use App\Services\ScheduleCandidateBuilderService;
use App\Services\ScheduleWriterService;
use App\Services\CPSATService;


class GenerateController extends Controller
{
    // ================================
    // UI PAGE (GENERATE SCREEN)
    // ================================
    public function index()
    {
        $versions = ScheduleVersion::with('semester')->get();

        $timeSlots = TimeSlot::all()->map(fn($t) => [
            'id' => $t->id,
            'day_of_week' => $t->day_of_week,
            'start_time' => $t->start_time,
            'end_time' => $t->end_time,
            'mode' => $t->mode,
            'status' => $t->status,
        ])->values();

        $rooms = Room::all()->map(fn($r) => [
            'id' => $r->id,
            'room_name' => $r->room_name,
        ])->values();

        $assignments = SectionSubjectAssignment::with([
            'section.program',
            'subject',
            'faculty'
        ])->get()->map(fn($a) => [
            'id' => $a->id,
            'section_id' => $a->section_id,
            'subject_id' => $a->subject_id,
            'faculty_id' => $a->faculty_id,
        ])->values();

        return Inertia::render("Schedules/Generate", [
            'versions' => $versions,
            'timeSlots' => $timeSlots,
            'rooms' => $rooms,
            'assignments' => $assignments,
        ]);
    }

    // ================================
    // RESET SCHEDULE
    // ================================
    public function reset($versionId)
    {
        Schedule::where('schedule_version_id', $versionId)->delete();

        return redirect()
            ->route('schedules.index')
            ->with('success', 'Schedule reset successfully');
    }

    // ================================
    // GENERATE SCHEDULE (FULL PIPELINE)
    // ================================
    public function generate(
        $versionId,
        ClassUnitService $classUnitService,
        ScheduleCandidateBuilderService $builder,
        CPSATService $solver,
        ScheduleWriterService $writer
    ) {
        set_time_limit(300);

        try {
            $sections = Section::all();
            $classUnits = $classUnitService->generate($sections);

            $allCandidates = [];

            foreach ($sections as $section) {

                $units = collect($classUnits)
                    ->where('section_id', $section->id)
                    ->values();

                if ($units->isEmpty()) continue;

                $candidates = $builder->build($section, $units);

                $allCandidates = array_merge($allCandidates, $candidates);
            }

            logger()->info('TOTAL CANDIDATES', [
                'count' => count($allCandidates)
            ]);

            if (empty($allCandidates)) {
                throw new \Exception("No candidates generated");
            }

            $optimized = $solver->solve($allCandidates);

            $writer->save($optimized, $versionId, 'A');

            return redirect()
                ->route('schedules.index')
                ->with('success', 'Schedule generated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Generation failed: ' . $e->getMessage());
        }
    }
}
