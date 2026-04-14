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
        $departmentId = $request->department_id ?? Department::first()?->id;
        $programId = $request->program_id ?? Programs::first()?->id;
        

        $curriculum = Curriculum::with(['subject', 'program.department'])
            ->where('program_id', $programId)
            ->whereHas('program.department', function ($q) use ($departmentId) {
                $q->where('id', $departmentId);
            })
            ->get()
            ->groupBy('year_level')
            ->map(function ($yearGroup) {

                $semesters = $yearGroup->groupBy('semester');

                return collect([1, 2])->mapWithKeys(function ($sem) use ($semesters) {

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

        return Inertia::render('Curriculum/Index', [
            'curriculum' => $curriculum,
            'departments' => Department::all(),
            'programs' => Programs::all(),
            'subjects' => Subject::all(),
            'selectedDepartment' => (int) $departmentId,
            'selectedProgram' => (int) $programId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'subject_id' => 'required|exists:subjects,id',
            'year_level' => 'required|integer|min:1|max:4',
            'semester' => 'required|integer|in:1,2',
        ]);

        $exists = Curriculum::where($validated)->exists();

        if ($exists) {
            return back()->with('error', 'Subject already exists in curriculum.');
        }

        Curriculum::create($validated);

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