<?php

namespace App\Http\Controllers;

use App\Models\Programs;
use App\Models\Subject;
use App\Models\CurriculumSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurriculumController extends Controller
{
    public function index(Request $request)
    {
        $programs = Programs::all();
        $selectedProgram = null;
        $curriculum = [];
        $availableSubjects = [];

        // If the admin has selected a program from the dropdown, load its specific data
        if ($request->has('program_id')) {
            $programId = $request->program_id;
            $selectedProgram = Programs::find($programId);

            // Load the current curriculum map for this program
            $curriculum = CurriculumSubject::with(['subject.prerequisite'])
                ->where('program_id', $programId)
                ->get();

            // Load available subjects: 
            // 1. Major subjects assigned to this specific program
            // 2. ALL Minor subjects (since they are shared across all programs)
            $availableSubjects = Subject::with('prerequisite')
                ->where(function($query) use ($programId) {
                    $query->where('program_id', $programId)
                          ->orWhere('type', 'Minor');
                })->get();
        }

        return Inertia::render('Curriculum/Index', [
            'programs' => $programs,
            'selectedProgram' => $selectedProgram,
            'curriculum' => $curriculum,
            'availableSubjects' => $availableSubjects
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'subject_id' => 'required|exists:subjects,id',
            'year_level' => 'required|integer|min:1|max:4',
            'semester' => 'required|integer|in:1,2'
        ]);

        // Prevent duplicate subjects in the same curriculum
        $exists = CurriculumSubject::where('program_id', $validated['program_id'])
            ->where('subject_id', $validated['subject_id'])
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors(['subject_id' => 'This subject is already in the curriculum.']);
        }

        CurriculumSubject::create($validated);

        return redirect()->back()->with('success', 'Subject added to curriculum.');
    }

    public function destroy($id)
    {
        $item = CurriculumSubject::findOrFail($id);
        $item->delete();
        
        return redirect()->back()->with('success', 'Subject removed from curriculum.');
    }
}