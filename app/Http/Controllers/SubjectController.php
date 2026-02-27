<?php

namespace App\Http\Controllers;

use App\Models\Programs;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    //

    public function index(Request $request)
    {
        // return Inertia::render('Subjects/Index', [
        //     'subjects' => Subject::with("program")->latest()->get(),
        //     'programs' => Programs::all(),
        // ]);

        $query = Subject::with('program');

        if ($request->program_id) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->semester) {
            $query->where('semester', $request->semester);
        }

        if ($request->year_level) {
            $query->where('year_level', $request->year_level);
        }

        return Inertia::render('Subjects/Index', [
            'subjects' => $query->latest()->get(),
            'programs' => Programs::all(),
            'filters' => $request->only(['program_id', 'semester', 'year_level'])
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => "required|exists:programs,id",
            'subject_code' => 'required',
            'subject_name' => 'required',
            'units' => 'required|integer|min:1',
            'lecture_hours' => 'required|integer|min:0',
            'lab_hours' => 'required|integer|min:0',
            'year_level' => 'required|integer|min:1|max:5',
            'semester' => 'required|integer|min:1|max:2'
        ]);
    
        $subject = Subject::create($validated);
    
        return redirect()->route('subject.index', [
            'program_id' => $subject->program_id,
            'semester' => $subject->semester,
            'year_level' => $subject->year_level
        ])->with('success', 'Subject created');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'program_id' => "required|exists:programs,id",
            'subject_code' => 'required',
            'subject_name' => 'required',
            'units' => 'required|integer|min:1',
            'lecture_hours' => 'required|integer|min:0',
            'lab_hours' => 'required|integer|min:0',
            'year_level' => 'required|integer|min:1|max:5',
            'semester' => 'required|integer|min:1|max:2'
        ]);

        $subject->update($validated);
        return redirect()->back()->with('success', 'subject updated');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return redirect()->back()->with('success', 'subject deleted');
    }
}
