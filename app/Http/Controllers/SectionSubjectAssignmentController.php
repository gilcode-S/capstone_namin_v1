<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\ScheduleVersion;
use App\Models\Section;
use App\Models\SectionSubjectAssignment;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionSubjectAssignmentController extends Controller
{
    //
    public function index()
    {
        return Inertia::render('Assignment/Index', [
            'assignments' => SectionSubjectAssignment::with([
                'section',
                'subject',
                'faculty',
                'version'
            ])->latest()->paginate(20),
            'sections' => Section::all(),
            'subjects' => Subject::all(),
            'faculties' => Faculty::all(),
            'versions' => ScheduleVersion::with('semester')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_version_id' => 'required|exists:schedule_versions,id',
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'faculty_id'  => 'required|exists:faculties,id',
        ]);

        SectionSubjectAssignment::create($validated);

        return redirect()->back()->with('success', 'assign created');
    }

    public function update(Request $request, SectionSubjectAssignment $assignment)
    {
        $validated = $request->validate([
            'schedule_version_id' => 'required|exists:schedule_versions,id',
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'faculty_id' => 'required|exists:faculties,id',
        ]);

        $assignment->update($validated);

        return redirect()->back()->with('success', 'Assignment Created');
    }


    public function destroy(SectionSubjectAssignment $assignment)
    {
        $assignment->delete();

        return redirect()->back()->with('success', 'assign deleted');
    }
}
