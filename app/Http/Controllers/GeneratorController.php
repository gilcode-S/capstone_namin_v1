<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\ScheduleVersion;
use App\Models\Section;
use App\Services\AuditLogService;
// use App\Services\GeneratorService;
use App\Services\ScheduleGeneratorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GeneratorController extends Controller
{
    /**
     * PAGE 9: Load the Pre-Flight Dashboard and calculate readiness.
     */
    public function index()
    {
        // 1. Calculate Faculty Readiness (% of teachers with domains)
        $totalTeachers = Teacher::count();
        $readyTeachers = Teacher::has('domain')->count();
        $facultyReadiness = $totalTeachers > 0 ? round(($readyTeachers / $totalTeachers) * 100) : 0;

        // 2. Calculate Room Capacity (Simple Check: Do we have rooms?)
        $totalRooms = Room::count();
        $roomReadiness = $totalRooms > 0 ? '100%' : '0%';

        // 3. Curriculum Integrity (Find Majors missing prerequisites)
        $problemSubjects = Subject::where('type', 'Major')
            ->whereNull('program_id')
            ->get();

        $warnings = [];
        foreach ($problemSubjects as $subject) {
            $warnings[] = [
                'subject' => $subject->code,
                'message' => 'Missing Program. Major subjects must be assigned to a specific Degree Program.'
            ];
        }


        // Return the React view with all calculated data
        return Inertia::render('Schedules/Generator', [
            'readiness' => [
                'faculty' => $facultyReadiness . '%',
                'rooms' => $roomReadiness
            ],
            'warnings' => $warnings,
        ]);
    }

    /**
     * THE TRIGGER: Run the algorithm and save the schedule.
     */
    public function generate(Request $request, ScheduleGeneratorService $generator)
    {
        // 1. Validate the incoming request (Year & Semester)
        $validated = $request->validate([
            'academic_year' => 'required|string',
            'semester' => 'required|string',
        ]);

        // 2. Create the "Version Container" in the database
        $latestVersion = ScheduleVersion::where(
            'academic_year',
            $validated['academic_year']
        )
            ->where('semester', $validated['semester'])
            ->max('version_number');

        $nextVersion = ($latestVersion ?? 0) + 1;

        $version = ScheduleVersion::create([
            'name' => strtoupper(
                $validated['academic_year'] . ' ' .
                    $validated['semester'] . ' SEMESTER'
            ),

            'academic_year' => $validated['academic_year'],

            'semester' => $validated['semester'],

            'version_number' => $nextVersion,

            'status' => 'Active',

            'effective_date' => now()->addWeeks(2),
        ]);

        /*
|--------------------------------------------------------------------------
| REMOVE OLD SCHEDULES FOR THIS VERSION
|--------------------------------------------------------------------------
*/




        // 3. EXECUTE THE ALGORITHM!
        // We pass the new Version ID to the service so it knows where to save the blocks
        // $generator->generate($version->id);

        // 🔥 THIS is the missing part
        // 🚀 ONLY USE THE REAL SCHEDULER
        $sections = Section::all();

        foreach ($sections as $section) {
            $generator->generateScheduleForSection($section, $version->id);
        }

        AuditLogService::custom(
            'Generate Schedule',
            'Scheduler',
            'Generated schedule version #' .
                $version->version_number .
                ' for ' .
                $version->academic_year .
                ' ' .
                $version->semester
        );

        // 4. Redirect to the Schedule Viewer (Page 8)
        return redirect()->route('schedules.viewer')->with('success', 'Optimization Algorithm completed successfully!');
    }

    public function reset(Request $request)
    {
        $validated = $request->validate([
            'academic_year' => 'required|string',
            'semester' => 'required|string',
        ]);

        $versions = ScheduleVersion::where(
            'academic_year',
            $validated['academic_year']
        )->where(
            'semester',
            $validated['semester']
        )->get();

        foreach ($versions as $version) {
            Schedule::where(
                'schedule_version_id',
                $version->id
            )->delete();

            $version->delete();
        }

        AuditLogService::custom(
            'Reset Schedule',
            'Scheduler',
            'Reset schedules for ' .
                $validated['academic_year'] .
                ' ' .
                $validated['semester']
        );

        return redirect()
            ->back()
            ->with('success', 'Schedules reset successfully.');
    }
}
