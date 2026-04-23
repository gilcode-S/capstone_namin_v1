<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Programs;
use App\Models\Section;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SectionController extends Controller
{
    //

    private function generateSectionCode($program, $year, $semesterId, $shift, $letter)
    {
        $semNumberMap = [
            '1st' => 1,
            '2nd' => 2,
            'summer' => 3,
        ];

        $semNumber = $semNumberMap[strtolower($semesterId->term)] ?? 1;
        $yearBase = ($year - 1) * 2 + $semNumber;

        $SHIFT_CODES = [
            'Morning' => 'M',
            'Afternoon' => 'D',
            'Evening' => 'E',
        ];

        $code = $program->program_code
            . $yearBase
            . $SHIFT_CODES[$shift]
            . strtoupper($letter);

        if ($semesterId === 'summer') {
            $code .= '-S';
        }

        return $code;
    }

    public function index(Request $request)
    {
        $view = $request->view ?? 'grid';

        $query = Section::with(['program.department', 'semester']);

        if ($request->section) {
            $query->where('section_name', 'like', '%' . $request->section . '%');
        }

        if ($request->year_level) {
            $query->where('year_level', (int) $request->year_level);
        }

        if ($request->filled('department')) {
            $query->whereHas('program.department', function ($q) use ($request) {
                $q->where('id', $request->department);
            });
        }

        if ($request->shift) {
            $query->where('shift', $request->shift);
        }

        // ✅ FIXED section filter (exact match last letter)
        if ($request->set) {
            $query->whereRaw('RIGHT(section_name, 1) = ?', [strtoupper($request->set)]);
        }

        // ✅ GET section letters dynamically
        $sectionLetters = Section::select(
            DB::raw('RIGHT(section_name, 1) as letter')
        )->distinct()->pluck('letter');

        return Inertia::render('Sections/Index', [
            'sections' => $query->latest()->paginate(25)->withQueryString(),
            'departments' => Department::all(),

            'programs' => Programs::with('department')->get(), // 👈 include department
            'semesters' => Semester::all(),

            'sectionLetters' => $sectionLetters, // 👈 NEW

            'view' => $view,

            'filters' => $request->only(['set', 'department', 'shift', 'section', 'year_level']),

            'stats' => [
                'total_sections' => Section::count(),
                'total_students' => Section::sum('student_count'),

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
            'semester_id' => 'required|exists:semesters,id',
            'year_level' => 'required|integer',
            'shift' => 'required|string',
            'section_letter' => 'required|string|max:1',
            'student_count' => 'nullable|integer',
        ]);

        $program = Programs::find($validated['program_id']);
        $semester = Semester::find($validated['semester_id']);

        $sectionCode = $this->generateSectionCode(
            $program,
            $validated['year_level'],
            $semester, // ✅ PASS MODEL
            $validated['shift'],
            $validated['section_letter']
        );

        $exists = Section::where('section_name', $sectionCode)->exists();

        if ($exists) {
            return back()->withErrors([
                'section_letter' => 'Section already exists!'
            ]);
        }

        Section::create([
            'program_id' => $validated['program_id'],
            'semester_id' => $validated['semester_id'],
            'year_level' => $validated['year_level'],
            'shift' => $validated['shift'],
            'student_count' => $validated['student_count'],
            'section_name' => $sectionCode,
        ]);

        return back()->with('success', 'Section Created');
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
