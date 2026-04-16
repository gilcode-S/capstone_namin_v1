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
    /* =====================================================
        AUTO ASSIGN FACULTY
    ===================================================== */
    private function assignFaculty($subject, $faculties, $scheduleVersionId)
    {
        // 🥇 HARD CONSTRAINT (Preferred Teacher)
        if ($subject->preferred_teacher_id) {
            $preferred = $faculties->firstWhere('id', $subject->preferred_teacher_id);

            if ($preferred) {
                return $preferred;
            }
        }

        $best = null;
        $bestScore = -9999;

        foreach ($faculties as $faculty) {

            // 🔥 CURRENT LOAD (safe calculation)
            $currentLoad = $faculty->assignments()
                ->where('schedule_version_id', $scheduleVersionId)
                ->with('subject')
                ->get()
                ->sum(fn($a) => $a->subject->units ?? 0);

            // ❌ Skip overloaded faculty
            if (
                !is_null($faculty->max_load_units) &&
                $faculty->max_load_units > 0 &&
                $currentLoad >= $faculty->max_load_units
            ) {
                continue;
            }

            // 🧠 SCORE COMPUTATION
            $score = $this->computeFacultyScore($faculty, $subject, $currentLoad);

            // 📉 BALANCE LOAD (VERY IMPORTANT)
            $score -= $currentLoad * 2;

            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $faculty;
            }
        }

        return $best;
    }

    /* =====================================================
        SCORING LOGIC
    ===================================================== */
    private function computeFacultyScore($faculty, $subject, $currentLoad)
    {
        $score = 0;

        // 🎯 Domain match (very important)
        if ($faculty->domains && in_array($subject->domain, $faculty->domains)) {
            $score += 10;
        }

        // 🎓 Experience boost
        $score += ($faculty->years_experience ?? 0);

        // 🎓 Qualification boost
        if ($faculty->qualification_level === 'masteral') {
            $score += 3;
        }

        if ($faculty->qualification_level === 'doctorate') {
            $score += 5;
        }

        // ⚖️ Prefer less loaded teachers
        $score += max(0, 10 - $currentLoad);

        return $score;
    }

    /* =====================================================
        INDEX
    ===================================================== */
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

    /* =====================================================
        STORE (AUTO ASSIGN HERE)
    ===================================================== */

    public function autoAssign(Request $request)
    {
        $request->validate([
            'schedule_version_id' => 'required|exists:schedule_versions,id',
        ]);

        $sections = Section::all();
        $faculties = Faculty::where('status', 'active')->get();

        if ($sections->isEmpty()) {
            return back()->withErrors(['error' => 'No sections found']);
        }

        if ($faculties->isEmpty()) {
            return back()->withErrors(['error' => 'No active faculty available']);
        }

        foreach ($sections as $section) {

            $subjects = Subject::where('year_level', $section->year_level)->get();

            foreach ($subjects as $subject) {

                $exists = SectionSubjectAssignment::where([
                    'schedule_version_id' => $request->schedule_version_id,
                    'section_id' => $section->id,
                    'subject_id' => $subject->id,
                ])->exists();

                if ($exists) continue;

                $faculty = $this->assignFaculty(
                    $subject,
                    $faculties,
                    $request->schedule_version_id
                );

                if (!$faculty) {
                    continue; // skip instead of breaking whole system
                }

                SectionSubjectAssignment::create([
                    'schedule_version_id' => $request->schedule_version_id,
                    'section_id' => $section->id,
                    'subject_id' => $subject->id,
                    'faculty_id' => $faculty->id,
                ]);
            }
        }

        return back()->with('success', 'Auto assignment for ALL sections completed!');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_version_id' => 'required|exists:schedule_versions,id',
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',

            // ✅ OPTIONAL now
            'faculty_id' => 'nullable|exists:faculties,id',
        ]);

        $subject = Subject::findOrFail($validated['subject_id']);

        // ✅ AUTO ASSIGN if no faculty selected
        if (!$request->faculty_id) {

            // ✅ only ACTIVE faculty
            $faculties = Faculty::where('status', 'active')->get();

            $faculty = $this->assignFaculty(
                $subject,
                $faculties,
                $validated['schedule_version_id']
            );

            if (!$faculty) {
                return back()->withErrors([
                    'faculty_id' => 'No available faculty found'
                ]);
            }

            $validated['faculty_id'] = $faculty->id;
        }

        SectionSubjectAssignment::create($validated);

        return back()->with('success', 'Assignment created (auto-assigned if empty)');
    }

    /* =====================================================
        UPDATE
    ===================================================== */
    public function update(Request $request, SectionSubjectAssignment $assignment)
    {
        $validated = $request->validate([
            'schedule_version_id' => 'required|exists:schedule_versions,id',
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'faculty_id' => 'required|exists:faculties,id',
        ]);

        $assignment->update($validated);

        return redirect()->back()->with('success', 'Assignment updated');
    }

    /* =====================================================
        DELETE
    ===================================================== */
    public function destroy(SectionSubjectAssignment $assignment)
    {
        $assignment->delete();

        return redirect()->back()->with('success', 'Assignment deleted');
    }
}
