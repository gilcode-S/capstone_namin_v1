<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\DomainGroup;
use App\Models\Faculty;
use App\Models\Programs;
use App\Models\Subject;
use App\Models\Room;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::with([
            'program',
            'domain',
            'prefTeacher',
            'prefRoom',
            'reqTeacher',
            'reqRoom',
            'prerequisite'
        ]);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('code', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->program_id) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->subject_type) {
            $query->where('type', $request->subject_type);
        }

        return Inertia::render('Subjects/Index', [
            'subjects' => $query
                ->latest()
                ->paginate(15)
                ->withQueryString(),

            'programs' => Programs::all(),

            'teachers' => Teacher::all(),

            'domains' => Domain::all(),

            'rooms' => Room::select('id', 'generated_name')->get(),

            'allSubjects' => Subject::select(
                'id',
                'name',
                'code',
                'type'
            )->get(),

            'filters' => $request->only([
                'program_id',
                'search',
                'subject_type'
            ]),

            'stats' => [
                'total_subject' => Subject::count(),
                'total_minor' => Subject::where('type', 'Minor')->count(),
                'total_major' => Subject::where('type', 'Major')->count(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code',
            'type' => 'required|in:Major,Minor',
            'units' => 'required|integer|min:1',
            'year_level' => 'nullable|integer|min:1|max:4',
            'program_id' => 'nullable|exists:programs,id',
            'domain_id' => 'nullable|exists:domains,id',

            'prerequisite_subject_id' => 'nullable|exists:subjects,id',

            // Preferred
            'pref_day' => 'nullable|string',
            'pref_shift' => 'nullable|in:Morning,Afternoon,Evening',
            'pref_teacher_id' => 'nullable|exists:teachers,id',
            'pref_room_id' => 'nullable|exists:rooms,id',

            // Required
            'req_day' => 'nullable|string',
            'req_shift' => 'nullable|in:Morning,Afternoon,Evening',
            'req_teacher_id' => 'nullable|exists:teachers,id',
            'req_room_id' => 'nullable|exists:rooms,id',
        ]);

        Subject::create($validated);

        return back()->with('success', 'Subject created successfully.');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code,' . $subject->id,
            'type' => 'required|in:Major,Minor',
            'units' => 'required|integer|min:1',
            'year_level' => 'required|integer|min:1|max:4',
            'program_id' => 'nullable|exists:programs,id',
            'domain_id' => 'nullable|exists:domains,id',

            'prerequisite_subject_id' => 'nullable|exists:subjects,id',

            // Preferred
            'pref_day' => 'nullable|string',
            'pref_shift' => 'nullable|in:Morning,Afternoon,Evening',
            'pref_teacher_id' => 'nullable|exists:teachers,id',
            'pref_room_id' => 'nullable|exists:rooms,id',

            // Required
            'req_day' => 'nullable|string',
            'req_shift' => 'nullable|in:Morning,Afternoon,Evening',
            'req_teacher_id' => 'nullable|exists:teachers,id',
            'req_room_id' => 'nullable|exists:rooms,id',
        ]);

        $subject->update($validated);

        return back()->with('success', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();
        return back()->with('success', 'Subject deleted');
    }
}
