<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Programs;
use App\Models\Domain;
use App\Models\Teacher;
use App\Models\Room;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index()
    {
        // Fetch all data needed for the dropdowns
        $programs = Programs::all();
        $domains = Domain::all();
        $teachers = Teacher::all();
        $rooms = Room::orderBy('generated_name')->get();

        // Fetch existing subjects to display in the table (and to use as prerequisites)
        $subjects = Subject::with(['program', 'domain', 'prerequisite', 'prefTeacher', 'reqRoom'])->latest()
            ->paginate(20)
            ->withQueryString();;

        return Inertia::render('Subjects/Index', [
            'programs' => $programs,
            'domains' => $domains,
            'teachers' => $teachers,
            'rooms' => $rooms,
            'subjects' => $subjects
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:subjects,code',
            'type' => 'required|in:Major,Minor',
            'units' => 'required|integer|min:1',
            'year_level' => 'required|integer|min:1|max:4',
            // Conditional Validation based on Subject Type
            'program_id' => 'required_if:type,Major|nullable|exists:programs,id',
            'prerequisite_subject_id' => 'nullable|exists:subjects,id',
            'domain_id' => 'required_if:type,Minor|nullable|exists:domains,id',

            // Soft Constraints (Preferences)
            'pref_day' => 'nullable|string',
            'pref_shift' => 'nullable|in:Morning,Afternoon,Evening',
            'pref_teacher_id' => 'nullable|exists:teachers,id',
            'pref_room_id' => 'nullable|exists:rooms,id',

            // Hard Constraints (Required)
            'req_day' => 'nullable|string',
            'req_shift' => 'nullable|in:Morning,Afternoon,Evening',
            'req_teacher_id' => 'nullable|exists:teachers,id',
            'req_room_id' => 'nullable|exists:rooms,id',
        ]);

        // Clean up data based on type (e.g. if Minor, ensure program is null)
        if ($validated['type'] === 'Minor') {
            $validated['program_id'] = null;
        } else {
            $validated['domain_id'] = null;
        }

        $subject = Subject::create($validated);

        AuditLogService::created(
            'Subject',
            "Created subject: {$subject->code} - {$subject->name}"
        );

        return redirect()->back()->with('success', 'Subject created successfully.');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:subjects,code,' . $subject->id,
            'type' => 'required|in:Major,Minor',
            'units' => 'required|integer|min:1',
            'year_level' => 'required|integer|min:1|max:4',

            'program_id' => 'nullable|exists:programs,id',
            'prerequisite_subject_id' => 'nullable|exists:subjects,id',
            'domain_id' => 'nullable|exists:domains,id',

            'pref_day' => 'nullable|string',
            'pref_shift' => 'nullable|in:Morning,Afternoon,Evening',
            'pref_teacher_id' => 'nullable|exists:teachers,id',
            'pref_room_id' => 'nullable|exists:rooms,id',

            'req_day' => 'nullable|string',
            'req_shift' => 'nullable|in:Morning,Afternoon,Evening',
            'req_teacher_id' => 'nullable|exists:teachers,id',
            'req_room_id' => 'nullable|exists:rooms,id',
        ]);

        if ($validated['type'] === 'Minor') {
            $validated['program_id'] = null;
        } else {
            $validated['domain_id'] = null;
        }

        $subject->update($validated);

        AuditLogService::updated(
            'Subject',
            "Updated subject: {$subject->code} - {$subject->name}"
        );

        return back()->with('success', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        AuditLogService::deleted(
            'Subject',
            "Deleted subject: {$subject->code} - {$subject->name}"
        );
        return redirect()->back()->with('success', 'Subject deleted.');
    }
}
