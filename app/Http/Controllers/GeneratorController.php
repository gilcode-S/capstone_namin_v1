<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\ScheduleVersion;
use App\Models\Section;
use App\Models\Timeslot;
use App\Services\AuditLogService;
use App\Services\ScheduleGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GeneratorController extends Controller
{
    /**
     * PAGE 9: Load the Pre-Flight Dashboard
     */
    public function index()
    {
        /**
         * FACULTY READINESS
         */
        $totalTeachers = Teacher::count();

        $readyTeachers = Teacher::has('domain')->count();

        $facultyReadiness =
            $totalTeachers > 0
            ? round(($readyTeachers / $totalTeachers) * 100)
            : 0;

        /**
         * ROOM READINESS
         */
        $totalRooms = Room::count();

        $roomReadiness =
            $totalRooms > 0
            ? '100%'
            : '0%';

        /**
         * CURRICULUM VALIDATION
         */
        $problemSubjects = Subject::where('type', 'Major')
            ->whereNull('program_id')
            ->get();

        $warnings = [];

        foreach ($problemSubjects as $subject) {

            $warnings[] = [
                'subject' => $subject->code,

                'message' =>
                'Missing Program. Major subjects must be assigned to a Degree Program.'
            ];
        }

        return Inertia::render(
            'Schedules/Generator',
            [
                'readiness' => [
                    'faculty' =>
                    $facultyReadiness . '%',

                    'rooms' =>
                    $roomReadiness,
                ],

                'warnings' => $warnings,
            ]
        );
    }

    /**
     * MAIN GENERATOR
     */
    public function generate(
        Request $request,
        ScheduleGeneratorService $generator
    ) {
    
        /**
         * VALIDATE REQUEST
         */
        $validated = $request->validate([
            'academic_year' => 'required|string',
            'semester' => 'required|string',
        ]);
    
        /**
         * PRE-FLIGHT CHECKS
         */
        if (Teacher::count() === 0) {
    
            return back()->withErrors([
                'generation' =>
                'No teachers found.'
            ]);
        }
    
        if (Room::count() === 0) {
    
            return back()->withErrors([
                'generation' =>
                'No rooms found.'
            ]);
        }
    
        if (Timeslot::count() === 0) {
    
            return back()->withErrors([
                'generation' =>
                'No timeslots found.'
            ]);
        }
    
        if (Section::count() === 0) {
    
            return back()->withErrors([
                'generation' =>
                'No sections found.'
            ]);
        }
    
        /**
         * CHECK SECTION FOR SEMESTER
         */
        $sections = Section::where(
            'semester',
            $validated['semester']
        )
            ->orderBy('year_level')
            ->orderBy('shift')
            ->get();
    
        if ($sections->isEmpty()) {
    
            return back()->withErrors([
                'generation' =>
                'No sections found for ' . $validated['semester']
            ]);
        }
    
        /**
         * CHECK CURRICULUM SUBJECTS
         */
        $hasCurriculumSubjects = DB::table('curriculum_subjects')
            ->where(
                'semester',
                $validated['semester']
            )
            ->exists();
    
        if (!$hasCurriculumSubjects) {
    
            return back()->withErrors([
                'generation' =>
                'No curriculum subjects found for ' .
                    $validated['semester']
            ]);
        }
    
        /**
         * PREVENT DUPLICATE ACTIVE SCHEDULES
         */
        $existingSchedules = ScheduleVersion::where(
            'academic_year',
            $validated['academic_year']
        )
            ->where(
                'semester',
                $validated['semester']
            )
            ->where(
                'status',
                'Active'
            )
            ->exists();
    
        if ($existingSchedules) {
    
            return back()->withErrors([
                'generation' =>
                'An active schedule already exists for this semester.'
            ]);
        }
    
        /**
         * ARCHIVE OLD ACTIVE VERSIONS
         */
        ScheduleVersion::where(
            'status',
            'Active'
        )->update([
            'status' => 'Archived'
        ]);
    
        /**
         * NEXT VERSION NUMBER
         */
        $latestVersion = ScheduleVersion::where(
            'academic_year',
            $validated['academic_year']
        )
            ->where(
                'semester',
                $validated['semester']
            )
            ->max('version_number');
    
        $nextVersion =
            ($latestVersion ?? 0) + 1;
    
        /**
         * CREATE VERSION
         */
        $version = ScheduleVersion::create([
            'name' => strtoupper(
                $validated['academic_year']
                    . ' ' .
                    $validated['semester']
                    . ' SEMESTER'
            ),
    
            'academic_year' =>
            $validated['academic_year'],
    
            'semester' =>
            $validated['semester'],
    
            'version_number' =>
            $nextVersion,
    
            'status' => 'Active',
    
            'effective_date' =>
            now()->addWeeks(2),
        ]);
    
        /**
         * FULL GENERATION TRANSACTION
         */
        DB::beginTransaction();
    
        try {
    
            foreach ($sections as $section) {
    
                $generator->generateScheduleForSection(
                    $section,
                    $version->id,
                    $validated['semester']
                );
            }
    
            DB::commit();
    
        } catch (\Exception $e) {
    
            DB::rollBack();
    
            /**
             * CLEAN FAILED VERSION
             */
            Schedule::where(
                'schedule_version_id',
                $version->id
            )->delete();
    
            $version->delete();
    
            return back()->withErrors([
                'generation' =>
                $e->getMessage()
            ]);
        }
    
        /**
         * AUDIT LOG
         */
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
    
        /**
         * REDIRECT
         */
        return redirect()
            ->route('schedules.viewer')
            ->with(
                'success',
                'Optimization Algorithm completed successfully!'
            );
    }

    /**
     * RESET SCHEDULES
     */
    public function reset(Request $request)
    {
        $validated = $request->validate([
            'academic_year' => 'required|string',

            'semester' => 'required|string',
        ]);

        $versions = ScheduleVersion::where(
            'academic_year',
            $validated['academic_year']
        )
            ->where(
                'semester',
                $validated['semester']
            )
            ->get();

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
            ->route('schedules.viewer')
            ->with(
                'success',
                'Schedule Reset successfully!'
            );
    }
}
