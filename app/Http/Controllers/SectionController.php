<?php

namespace App\Http\Controllers;

use App\Models\Programs;
use App\Models\Section;
use App\Models\Semester;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    //

    private function generateSectionCode($program, $year, $sem, $shift, $letter)
    {
        $YEAR_BASE = [
            1 => 1,
            2 => 3,
            3 => 5,
            4 => 7,
        ];

        $SHIFT_CODES = [
            'Morning' => 'M',
            'Afternoon' => 'D',
            'Evening' => 'E',
        ];

        $code = $program->program_code
            . $YEAR_BASE[$year]
            . $SHIFT_CODES[$shift]
            . strtoupper($letter);

        if ($sem === 'Summer') {
            $code .= '-S';
        }

        return $code;
    }

    public function index(Request $request)
    {
        $view = $request->view ?? 'grid';
        $query = Section::with('program', 'semester');

        //  FILTER: SET (A / B)
        if ($request->set) {

            $query->where('section_name', 'like', $request->set . '%');
        }
        if ($request->year_level) {
            $query->where('year_level', $request->year_level);
        }

        if ($request->section) {
            $query->where('section_name', 'like', '%' . $request->section . '%');
        }

        //  PROGRAM (Department)
        if ($request->program) {
            $query->where('program_id', $request->program);
        }

        //  SHIFT
        if ($request->shift) {
            $query->where('shift', $request->shift);
        }

        //  SECTION NAME (exact match)
        if ($request->section) {
            $query->where('section_name', $request->section);
        }

        return Inertia::render('Sections/Index', [
            'sections' => $query->latest()->paginate(25)->withQueryString(),

            'programs' => Programs::all(),
            'semesters' => Semester::all(),

            'view' => $view,

            'filters' => $request->only(['set', 'program', 'shift', 'section']),

            'stats' => [
                'total_classes' => 0,
                'weekly_hour' => 0,
                'active_rooms' => 0,
                'total_sections' => Section::count()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'semester_id' => 'required|exists:semesters,id',
            'section_name' => 'required|string|max:10',
            'year_level' => 'required|integer',
            'student_count' => 'nullable|integer',
            'shift' => 'required|string',
            'octoberian' => 'nullable|boolean',
        ]);

        Section::create($validated);

        return redirect()->back()->with('success', 'Section Created');
    }

    public function update(Request $request, Section $section)
    {
        $validate = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'semester_id' => 'required|exists:semesters,id',
            'section_name' => 'required|string|max:10',
            'year_level' => 'required|integer',
            'student_count' => 'nullable|integer',
            'shift' => 'required|string',
            'octoberian' => 'nullable|boolean',

        ]);

        $section->update($validate);

        return redirect()->back()->with('success', 'section updated');
    }

    public function destroy(Section $section)
    {
        $section->delete();

        return redirect()->back()->with('success', 'Section Deleted');
    }
}
