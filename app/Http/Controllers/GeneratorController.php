<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Room;
use App\Models\ScheduleVersion;
use App\Services\GeneratorService;
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
            ->whereNull('prerequisite_subject_id')
            ->get();

        $warnings = [];
        foreach ($problemSubjects as $subject) {
            $warnings[] = [
                'subject' => $subject->code,
                'message' => 'Missing prerequisite. This major subject lacks a foundational requirement.'
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
    public function generate(Request $request, GeneratorService $generator)
    {
        // 1. Validate the incoming request (Year & Semester)
        $validated = $request->validate([
            'academic_year' => 'required|string',
            'semester' => 'required|string',
        ]);

        // 2. Create the "Version Container" in the database
        $version = ScheduleVersion::create([
            'name' => $validated['academic_year'] . ' - ' . $validated['semester'],

            'academic_year' => $validated['academic_year'],
            'semester' => $validated['semester'],
            'status' => 'Draft' // Always start as Draft
        ]);

        // 3. EXECUTE THE ALGORITHM!
        // We pass the new Version ID to the service so it knows where to save the blocks
        $generator->generate($version->id);

        // 4. Redirect to the Schedule Viewer (Page 8)
        return redirect()->route('schedules.viewer')->with('success', 'Optimization Algorithm completed successfully!');
    }
}
