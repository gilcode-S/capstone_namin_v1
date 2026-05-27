<?php

namespace App\Http\Controllers;

use App\Models\Programs;
use App\Models\Subject;
use App\Models\CurriculumSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\AuditLogService;

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

            // Load available subjects
            $availableSubjects = Subject::with('prerequisite')
                ->where(function ($query) use ($programId) {
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

        // Prevent duplicate subjects
        $exists = CurriculumSubject::where('program_id', $validated['program_id'])
            ->where('subject_id', $validated['subject_id'])
            ->exists();

        if ($exists) {
            return redirect()->back()
                ->withErrors([
                    'subject_id' => 'This subject is already in the curriculum.'
                ]);
        }

        $curriculum = CurriculumSubject::create($validated);

        // Get related info
        $program = Programs::find($validated['program_id']);
        $subject = Subject::find($validated['subject_id']);

        // AUDIT LOG
        AuditLogService::created(
            'Curriculum',
            "Added subject {$subject->code} to {$program->code} curriculum (Year {$validated['year_level']} - Semester {$validated['semester']})"
        );

        return redirect()->back()
            ->with('success', 'Subject added to curriculum.');
    }

    public function destroy($id)
    {
        $item = CurriculumSubject::with(['subject', 'program'])
            ->findOrFail($id);

        // Save info before delete
        $subjectCode = $item->subject->code ?? 'Unknown Subject';
        $programCode = $item->program->code ?? 'Unknown Program';

        $item->delete();

        // AUDIT LOG
        AuditLogService::deleted(
            'Curriculum',
            "Removed subject {$subjectCode} from {$programCode} curriculum"
        );

        return redirect()->back()
            ->with('success', 'Subject removed from curriculum.');
    }
}