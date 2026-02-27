<?php

namespace App\Http\Controllers;

use App\Models\Programs;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    //
    public function index()
    {
        return Inertia::render('Sections/Index', [
            'sections' => Section::with('program')->latest()->get(),
            'programs' => Programs::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'section_name' => 'required',
            'year_level' => 'required|integer|min:1|max:5',
            'student_count' => 'nullable|integer|min:0'
        ]);

        Section::create($validated);

        return redirect()->back()->with('success', 'Section Created');
    }

    public function update(Request $request, Section $section)
    {
        $validate = $request->validate([
            'program_id' => 'required|exists:programs, id',
            'section_name' => 'required',
            'year_level' => 'required|integer|min:1|max:5',
            'student_count' => 'nullable|integer|max:0',
        ]);
    }

    public function destroy(Section $section)
    {
        $section->delete();

        return redirect()->back()->with('success' , 'Section Deleted');
    }
}
