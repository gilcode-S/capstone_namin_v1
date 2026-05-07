<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Programs;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Section::with([
            'program.department'
        ]);

        // SEARCH
        if ($request->section) {
            $query->where('name', 'like', '%' . $request->section . '%');
        }

        // YEAR
        if ($request->year_level) {
            $query->where('year_level', $request->year_level);
        }

        // PROGRAM
        if ($request->program) {
            $query->where('program_id', $request->program);
        }

        // DEPARTMENT
        if ($request->department) {
            $query->whereHas('program.department', function ($q) use ($request) {
                $q->where('id', $request->department);
            });
        }

        // SHIFT
        if ($request->shift) {
            $query->where('shift', $request->shift);
        }

        // LETTER
        if ($request->letter) {
            $query->where('letter', $request->letter);
        }

        $sectionLetters = Section::distinct()
            ->pluck('letter');

        return Inertia::render('Sections/Index', [
            'sections' => $query
                ->latest()
                ->paginate(10)
                ->withQueryString(),

            'programs' => Programs::with('department')->get(),

            'departments' => Department::all(),

            'sectionLetters' => $sectionLetters,

            'filters' => $request->only([
                'section',
                'year_level',
                'program',
                'department',
                'shift',
                'letter',
            ]),

            'stats' => [
                'total_sections' => Section::count(),

                'total_capacity' => Section::sum('capacity'),

                'total_morning' => Section::where('shift', 'Morning')->count(),

                'total_afternoon' => Section::where('shift', 'Afternoon')->count(),

                'total_evening' => Section::where('shift', 'Evening')->count(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'year_level' => 'required|integer|min:1|max:4',
            'semester' => 'required|integer|min:1|max:2',
            'shift' => 'required|in:Morning,Afternoon,Evening',
            'letter' => 'required|string|max:1',
            'capacity' => 'required|integer|min:1',
            'is_octoberian' => 'nullable|boolean',
        ]);

        Section::create([
            'program_id' => $validated['program_id'],
            'year_level' => $validated['year_level'],
            'semester' => $validated['semester'],
            'shift' => $validated['shift'],
            'letter' => strtoupper($validated['letter']),
            'capacity' => $validated['capacity'],
            'is_octoberian' => $validated['is_octoberian'] ?? false,
        ]);

        return back()->with('success', 'Section created successfully.');
    }

    public function update(Request $request, Section $section)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'year_level' => 'required|integer|min:1|max:4',
            'semester' => 'required|integer|min:1|max:2',
            'shift' => 'required|in:Morning,Afternoon,Evening',
            'letter' => 'required|string|max:1',
            'capacity' => 'required|integer|min:1',
            'is_octoberian' => 'nullable|boolean',
        ]);

        $section->update([
            'program_id' => $validated['program_id'],
            'year_level' => $validated['year_level'],
            'semester' => $validated['semester'],
            'shift' => $validated['shift'],
            'letter' => strtoupper($validated['letter']),
            'capacity' => $validated['capacity'],
            'is_octoberian' => $validated['is_octoberian'] ?? false,
        ]);

        return back()->with('success', 'Section updated successfully.');
    }

    public function destroy(Section $section)
    {
        $section->delete();

        return back()->with('success', 'Section deleted successfully.');
    }
}