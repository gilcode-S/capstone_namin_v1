<?php

namespace App\Http\Controllers;

use App\Models\CurriculumSubject;
use App\Models\Section;
use App\Models\Schedule;
use App\Services\ScheduleGeneratorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    /**
     * Display Page 8 (Schedule Viewer)
     */
    public function index()
    {
        // Pull all schedules and their connected data
        $schedules = Schedule::with(['section.program', 'subject', 'teacher', 'room', 'timeslot'])->get();

        return Inertia::render('Schedules/Viewer', [
            'schedules' => $schedules
        ]);
    }

    public function create(Request $request, ScheduleGeneratorService $algorithm)
    {
        // 1. Get all sections for the dropdown
        $sections = Section::with('program')->get();
        $previewData = null;
        $selectedSection = null;

        // 2. If the user selected a section, generate the preview
        if ($request->has('section_id')) {
            $selectedSection = Section::with('program')->find($request->section_id);

            // Get exact subjects from Page 3 (Curriculum)
            $curriculumSubjects = CurriculumSubject::where('program_id', $selectedSection->program_id)
                ->where('year_level', $selectedSection->year_level)
                ->where('semester', $selectedSection->semester)
                ->with('subject')
                ->get();

            // Run the Competency Matcher for Preview
            $previewData = $curriculumSubjects->map(function ($curr) use ($algorithm, $selectedSection) {
                // We use the same ranking logic, but only grab the Top 3 to show the Admin
                $rankedTeachers = $algorithm->rankTeachersForSubject($curr->subject, $selectedSection);

                return [
                    'subject' => $curr->subject,
                    'top_teachers' => $rankedTeachers->take(3),
                    'status' => $rankedTeachers->isEmpty() ? 'Error: No Competent Teacher' : 'Ready'
                ];
            });
        }

        return Inertia::render('Schedules/Generate', [
            'sections' => $sections,
            'selectedSection' => $selectedSection,
            'previewData' => $previewData
        ]);
    }

    /**
     * PAGE 10 -> PAGE 11: The Generation Trigger
     */
    public function generate(Request $request, ScheduleGeneratorService $algorithm)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id'
        ]);

        $section = Section::findOrFail($request->section_id);

        try {
            // FIRE THE ENGINE! 🚀
            $algorithm->generateScheduleForSection($section);

            return redirect()->route('schedules.index')
                ->with('success', "Schedule generated successfully for {$section->name}!");
        } catch (\Exception $e) {
            // If the algorithm fails (e.g., no competent teacher found), send the error to the UI
            return redirect()->back()
                ->with('error', "Generation Failed: " . $e->getMessage());
        }
    }
}
