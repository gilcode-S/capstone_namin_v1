<?php

namespace App\Http\Controllers;

use App\Models\ClassUnit;
use App\Models\Section;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\SectionSubjectAssignment;
use App\Models\Room;
use App\Models\TimeSlot;
use App\Models\Schedule;
use App\Models\ScheduleVersion;

use App\Models\Semester;
use App\Services\CPSATSchedulerService;
use App\Services\SetScheduleService;
use Illuminate\Support\Facades\Auth;

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


        $sections = Section::all()->map(fn($s) => [
            'id' => $s->id,
            'section_name' => $s->section_name,
        ])->values();

        return Inertia::render("Schedules/Generate", [
            'versions' => $versions,
            'timeSlots' => $timeSlots,
            'rooms' => $rooms,
            'assignments' => $assignments,
            'sections' => $sections, // NEW
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
    public function generate(Request $request)
    {
        $scheduler = app(CPSATSchedulerService::class);
        $semester = Semester::where('term', $request->semester)->first();

        if (!$semester) {
            return back()->with('error', 'Semester not found.');
        }

        set_time_limit(300);

        try {

            $version = ScheduleVersion::create([
                'name' => $request->academic_year . ' - ' . $request->semester,
                'version_number' => ScheduleVersion::count() + 1,
                'semester_id' => $semester->id,
                'effective_date' => $request->effective_date,
                'set_a_count' => 0,
                'set_b_count' => 0,
                'status' => 'draft',
                'created_by' => Auth::id(),
            ]);

            app(\App\Services\CurriculumEngineService::class)
                ->generateAllClassUnits();

            logger("Starting CP-SAT for version ID: " . $version->id);

            $scheduler->generateSchedule($version->id);

            return redirect()
                ->route('schedules.index')
                ->with('success', 'Schedule generated successfully');
        } catch (\Exception $e) {

            logger()->error('Generate Schedule Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return back()->with('error', 'Generation failed. Check logs.');
        }
    }

    public function generateSchedule(Request $request)
    {
        $service = new \App\Services\ScheduleGenerationService();

        return $service->generate($request->version_id);
    }

    public function generateFinal(Request $request)
    {
        // --------------------------------------------------
        // INPUT DATA FROM FRONTEND
        // --------------------------------------------------
        $versionId = $request->version_id; // schedule version
        $cpSatResult = $request->schedule; // result from python

        // --------------------------------------------------
        // CALL SERVICE
        // --------------------------------------------------
        $service = new SetScheduleService();
        $service->generate($versionId, $cpSatResult);

        // --------------------------------------------------
        // RESPONSE
        // --------------------------------------------------
        return response()->json([
            'message' => 'Final Schedule Generated Successfully'
        ]);
    }


    public function createNewVersion(Request $request)
{
    // Validate incoming request
    $validated = $request->validate([
        'academic_year' => 'required|string',
        'semester' => 'required|string',
        'effective_date' => 'required|date',
        'version_name' => 'nullable|string',
    ]);

    try {
        // Create new schedule version
        $scheduleVersion = ScheduleVersion::create([
            'name' => $validated['version_name'] ?? 'Schedule ' . now()->format('Y-m-d'),
            'semester_id' => 1, // Replace with the actual semester ID if needed
            'version_number' => ScheduleVersion::count() + 1, // Increment version number
            'effective_date' => $validated['effective_date'],
            'set_a_count' => 0, // You can adjust this based on your needs
            'set_b_count' => 0, // You can adjust this based on your needs
            'status' => 'draft',
            'created_by' => Auth::id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'version_id' => $scheduleVersion->id
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to create version',
            'message' => $e->getMessage()
        ], 500);
    }
} 
}
