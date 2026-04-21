<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Programs;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::with(['program', 'prerequisites']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('subject_name', 'like', '%' . $request->search . '%')
                    ->orWhere('subject_code', 'like', '%' . $request->search . '%');
            });
        }

        // if ($request->room_type) {
        //     $query->where('room_type', $request->room_type);
        // }

        if ($request->program_id) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->semester) {
            $query->where('semester', $request->semester);
        }

        if ($request->year_level) {
            $query->where('year_level', $request->year_level);
        }

        if ($request->subject_type) {
            $query->where('subject_type', $request->subject_type);
        }

        return Inertia::render('Subjects/Index', [
            'subjects' => $query->oldest()->paginate(15)->withQueryString(),
            'programs' => Programs::all(),
            'teachers' => Faculty::all(),
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
            'program_id' => 'nullable|exists:programs,id',
            'subject_code' => 'required|string|max:20',
            'subject_name' => 'required|string|max:150',
            'subject_type' => 'required|in:major,minor',
            'hours_per_week' => 'required|integer|min:1',
            'room_type' => 'nullable|in:classroom,laboratory,pe_room',
            'year_level' => 'required|integer|min:1|max:5',
            'semester' => 'required|integer|min:1|max:3',

            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'exists:subjects,id',

            // ✅ NEW
            'preferred_teacher_id' => 'nullable|exists:faculties,id',
            'preferred_day' => 'nullable|string|max:20',
            'preferred_shift' => 'nullable|string|max:20',
            'domains' => 'nullable|array',
            'domains.*' => 'string|max:100',
        ]);

        // ✅ enforce program only for major
        // if ($request->subject_type === 'major' && !$request->program_id) {
        //     return back()->withErrors([
        //         'program_id' => 'Program is required for major subjects.'
        //     ]);
        // }

        $validated['units'] = $validated['hours_per_week'];
        $validated['domains'] = $request->domains ?? [];

        $subject = Subject::create($validated);
        if ($validated['subject_type'] === 'major' && $subject->program) {
            $subject->domain = $subject->program->domain ?? null;
            $subject->save();
        }
        $subject->prerequisites()->sync(
            array_unique($request->prerequisites ?? [])
        );

        return back()->with('success', 'Subject created');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'program_id' => 'nullable|exists:programs,id',
            'subject_code' => 'required|string|max:20',
            'subject_name' => 'required|string|max:150',
            'subject_type' => 'required|in:major,minor',
            'hours_per_week' => 'required|integer|min:1',
            'room_type' => 'nullable|string|max:50',
            'year_level' => 'required|integer|min:1|max:5',
            'semester' => 'required|integer|min:1|max:3',

            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'exists:subjects,id',

            // ✅ NEW
            'preferred_teacher_id' => 'nullable|exists:faculties,id',
            'preferred_day' => 'nullable|string|max:20',
            'preferred_shift' => 'nullable|string|max:20',
            'domains' => 'nullable|array',
            'domains.*' => 'string|max:100',
        ]);

        // if ($request->subject_type === 'major' && !$request->program_id) {
        //     return back()->withErrors([
        //         'program_id' => 'Program is required for major subjects.'
        //     ]);
        // }

        $validated['units'] = $validated['hours_per_week'];
        $validated['domains'] = $request->domains ?? [];
        $subject->update($validated);
        if ($validated['subject_type'] === 'major' && $subject->program) {
            $subject->domain = $subject->program->domain ?? null;
            $subject->save();
        }
        $subject->prerequisites()->sync(
            array_unique($request->prerequisites ?? [])
        );

        return back()->with('success', 'Subject updated');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();
        return back()->with('success', 'Subject deleted');
    }
}
