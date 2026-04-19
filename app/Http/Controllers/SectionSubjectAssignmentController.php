<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\ScheduleVersion;
use App\Models\Section;
use App\Models\SectionSubjectAssignment;
use App\Models\Subject;
use App\Services\Scheduler\ScoringService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionSubjectAssignmentController extends Controller
{
    /* =====================================================
        AUTO ASSIGN FACULTY (SCORING ENGINE VERSION)
    ===================================================== */
    private function assignFaculty($subject, $faculties, $scheduleVersionId)
    {
        $scoring = new ScoringService();

        // 🥇 Preferred teacher (hard rule)
        if ($subject->preferred_teacher_id) {
            $preferred = $faculties->firstWhere('id', $subject->preferred_teacher_id);

            if ($preferred) {
                return $preferred;
            }
        }

        $best = null;
        $bestScore = -1;

        foreach ($faculties as $faculty) {

            // 🔥 current load
            $currentLoad = $faculty->assignments()
                ->where('schedule_version_id', $scheduleVersionId)
                ->with('subject')
                ->get()
                ->sum(fn($a) => $a->subject->units ?? 0);

            // ❌ skip overloaded
            if (
                $faculty->max_load_units &&
                $currentLoad >= $faculty->max_load_units
            ) {
                continue;
            }

            // 🧠 SCORING SERVICE (NEW)
            $score = $scoring->score($faculty, $currentLoad);

            // 📉 slight balancing penalty
            $score -= $currentLoad * 0.5;

            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $faculty;
            }
        }

        return $best;
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
        AUTO ASSIGN ALL
    ===================================================== */
    public function autoAssign(Request $request)
    {
        $request->validate([
            'schedule_version_id' => 'required|exists:schedule_versions,id',
        ]);

        $sections = Section::all();
        $faculties = Faculty::where('status', 'active')->get();

        if ($sections->isEmpty() || $faculties->isEmpty()) {
            return back()->withErrors(['error' => 'Missing data']);
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

                if (!$faculty) continue;

                SectionSubjectAssignment::create([
                    'schedule_version_id' => $request->schedule_version_id,
                    'section_id' => $section->id,
                    'subject_id' => $subject->id,
                    'faculty_id' => $faculty->id,
                ]);
            }
        }

        return back()->with('success', 'Auto assignment completed');
    }

    /* =====================================================
        STORE
    ===================================================== */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_version_id' => 'required|exists:schedule_versions,id',
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'faculty_id' => 'nullable|exists:faculties,id',
        ]);

        if (!$validated['faculty_id']) {

            $subject = Subject::findOrFail($validated['subject_id']);
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

        return back()->with('success', 'Assignment created');
    }

    /* =====================================================
        UPDATE
    ===================================================== */
    public function update(Request $request, SectionSubjectAssignment $assignment)
    {
        $assignment->update($request->validate([
            'schedule_version_id' => 'required|exists:schedule_versions,id',
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'faculty_id' => 'required|exists:faculties,id',
        ]));

        return back()->with('success', 'Updated');
    }

    /* =====================================================
        DELETE
    ===================================================== */
    public function destroy(SectionSubjectAssignment $assignment)
    {
        $assignment->delete();

        return back()->with('success', 'Deleted');
    }
}