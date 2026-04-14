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

        $query = Subject::with(['program', 'prerequisites']);
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('subject_name', 'like', '%' . $request->search . '%')
                    ->orWhere('subject_code', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->room_type) {
            $query->where('room_type', $request->room_type);
        }

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
            'subjects' => $query->latest()->paginate(15)->withQueryString(),
            'programs' => Programs::all(),
            'allSubjects' => Subject::select('id', 'subject_name', 'subject_code')->get(),

            'filters' => $request->only([
                'program_id',
                'semester',
                'year_level',
                'search',
                'room_type',
                'subject_type'
            ]),

            'stats' => [
                'total_subject' => Subject::count(),
                'total_minor' => Subject::where('subject_type', 'minor')->count(),
                'total_major' => Subject::where('subject_type', 'major')->count(),
            ]
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'subject_code' => 'required|string|max:20',
            'subject_name' => 'required|string|max:150',
            'subject_type' => 'required|in:major,minor',
            'hours_per_week' => 'required|integer|min:1',
            'room_type' => 'nullable|string|max:50',
            'year_level' => 'required|integer|min:1|max:5',
            'semester' => 'required|integer|min:1|max:3',
            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'exists:subjects,id',
        ]);
        $validated['units'] = $validated['hours_per_week'];
        $subject = Subject::create($validated);
        $subject->prerequisites()->sync($request->prerequisites ?? []);

        return redirect()->back()->with('success', 'Subject created');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'subject_code' => 'required|string|max:20',
            'subject_name' => 'required|string|max:150',
            'subject_type' => 'required|in:major,minor',
            'hours_per_week' => 'required|integer|min:1',
            'room_type' => 'nullable|string|max:50',
            'year_level' => 'required|integer|min:1|max:5',
            'semester' => 'required|integer|min:1|max:3',
            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'exists:subjects,id',
        ]);
        $validated['units'] = $validated['hours_per_week'];
        $subject->update($validated);
        $subject->prerequisites()->sync($request->prerequisites ?? []);
        return redirect()->back()->with('success', 'subject updated');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return redirect()->back()->with('success', 'subject deleted');
    }
}
