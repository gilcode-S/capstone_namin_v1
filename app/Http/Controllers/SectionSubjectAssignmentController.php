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

    private function assignFaculty($subject, $faculties)
    {
        // ✅ HARD CONSTRAINT
        if ($subject->preferred_teacher) {
            $preferred = $faculties->firstWhere('id', $subject->preferred_teacher);
            if ($preferred) return $preferred;
        }

        $best = null;
        $bestScore = -1;

        foreach ($faculties as $faculty) {

            $currentLoad = $faculty->assignments()
                ->where('schedule_version_id', request('schedule_version_id'))
                ->count();

            if ($currentLoad >= $faculty->max_load_units) {
                continue;
            }

            $score = $this->computeFacultyScore($faculty, $subject);

            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $faculty;
            }
        }

        return $best;
    }

    private function computeFacultyScore($faculty, $subject)
    {
        $score = 0;

        // ✅ Match subject domain
        if ($faculty->domains && in_array($subject->domain, $faculty->domains)) {
            $score += 3;
        }

        // ✅ Experience bonus
        $score += min($faculty->years_experience ?? 0, 5);

        // ✅ Qualification bonus
        if ($faculty->qualification_level === 'masteral') {
            $score += 2;
        }

        if ($faculty->qualification_level === 'doctorate') {
            $score += 3;
        }

        return $score;
    }
    public function index()
    {
        return Inertia::render('Assignment/Index', [
            'assignments' => SectionSubjectAssignment::with([
                'section',
                'subject',
                'faculty',
                'version.semester'
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

            // ❌ make optional now
            'faculty_id' => 'nullable|exists:faculties,id',
        ]);

        $subject = Subject::findOrFail($validated['subject_id']);

        // ✅ if no faculty selected → auto assign
        if (!$request->faculty_id) {

            $faculties = Faculty::all();

            $faculty = $this->assignFaculty($subject, $faculties);

            if (!$faculty) {
                return back()->withErrors([
                    'faculty_id' => 'No available faculty found'
                ]);
            }

            $validated['faculty_id'] = $faculty->id;
        }

        SectionSubjectAssignment::create($validated);

        return back()->with('success', 'Assignment created');
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
