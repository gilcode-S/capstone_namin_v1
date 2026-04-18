<?php

namespace App\Http\Controllers;

use App\Models\Curriculum;
use App\Models\Department;
use App\Models\Programs;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurriculumController extends Controller
{
    public function index(Request $request)
    {
        $departmentId = $request->department_id;
        $programId = $request->program_id;

        $departments = Department::all();

        $programs = $departmentId
            ? Programs::where('department_id', $departmentId)->get()
            : collect();

        $subjects = $programId
            ? Subject::where(function ($q) use ($programId) {
                $q->where('program_id', $programId)
                    ->orWhere('subject_type', 'minor');
            })->get()
            : collect();

        $curriculum = collect();

        if ($programId) {
            $curriculum = Curriculum::with('subject')
                ->where('program_id', $programId)
                ->get()
                ->groupBy('year_level')
                ->map(function ($yearGroup) {

                    $semesters = $yearGroup->groupBy('semester');

                    return collect([1, 2, 3])->mapWithKeys(function ($sem) use ($semesters) {

                        $semGroup = $semesters->get($sem, collect());

                        return [
                            $sem => [
                                'major' => $semGroup->filter(
                                    fn($c) => optional($c->subject)->subject_type === 'major'
                                )->values(),

                                'minor' => $semGroup->filter(
                                    fn($c) => optional($c->subject)->subject_type === 'minor'
                                )->values(),
                            ]
                        ];
                    });
                });
        }

        return Inertia::render('Curriculum/Index', [
            'curriculum' => $curriculum,
            'departments' => $departments,
            'programs' => $programs,
            'subjects' => $subjects,
            'selectedDepartment' => $departmentId,
            'selectedProgram' => $programId,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'subject_id' => 'required|exists:subjects,id',
            'year_level' => 'required|integer|min:1|max:4',
            'semester' => 'required|integer|in:1,2,3',
            'ignore_prereq' => 'nullable|boolean', // ✅ NEW

        ]);

        // ✅ Prevent duplicate
        $exists = Curriculum::where([
            'program_id' => $validated['program_id'],
            'subject_id' => $validated['subject_id'],
            'year_level' => $validated['year_level'],
            'semester' => $validated['semester'],
        ])->exists();

        if ($exists) {
            return back()->with('error', 'Subject already exists in curriculum.');
        }

        // ✅ GET SUBJECT + PREREQUISITES
        $subject = Subject::with('prerequisites')->find($validated['subject_id']);

        // ✅ ONLY VALIDATE if NOT ignored
        if (!$request->ignore_prereq) {

            foreach ($subject->prerequisites as $pre) {

                $hasPrerequisite = Curriculum::where([
                    'program_id' => $validated['program_id'],
                    'subject_id' => $pre->id,
                ])
                    ->where(function ($q) use ($validated) {
                        $q->where('year_level', '<', $validated['year_level'])
                            ->orWhere(function ($q2) use ($validated) {
                                $q2->where('year_level', $validated['year_level'])
                                    ->where('semester', '<', $validated['semester']);
                            });
                    })
                    ->exists();

                if (!$hasPrerequisite) {
                    return back()->with(
                        'error',
                        "Missing prerequisite: {$pre->subject_code} must be added earlier."
                    );
                }
            }
        }

        Curriculum::create([
            'program_id' => $validated['program_id'],
            'subject_id' => $validated['subject_id'],
            'year_level' => $validated['year_level'],
            'semester' => $validated['semester'],
        ]);

        return back()->with('success', 'Subject added to curriculum.');
    }

    public function update(Request $request, $id)
    {
        $curriculum = Curriculum::findOrFail($id);

        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'subject_id' => 'required|exists:subjects,id',
            'year_level' => 'required|integer|min:1|max:4',
            'semester' => 'required|integer|in:1,2',
        ]);

        $exists = Curriculum::where($validated)
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Duplicate curriculum entry.');
        }

        $curriculum->update($validated);

        return back()->with('success', 'Curriculum updated.');
    }

    public function destroy($id)
    {
        Curriculum::findOrFail($id)->delete();

        return back()->with('success', 'Curriculum deleted.');
    }
}
