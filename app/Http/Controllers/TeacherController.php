<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Department;
use App\Models\DomainGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherController extends Controller
{
    //
    public function index()
    {
        // We load the relationships so React has the names, not just IDs
        $teachers = Teacher::with(['department', 'domainGroup', 'specialization'])->get();

        // We also send the dropdown options for the "Add Teacher" modal
        $departments = Department::all();
        $domainGroups = DomainGroup::with('domains')->get();

        return Inertia::render('Teacher/Index', [
            'teachers' => $teachers,
            'departments' => $departments,
            'domainGroups' => $domainGroups
        ]);
    }

    public function store(Request $request)
    {
        // 1. Strict Validation
        $validated = $request->validate([
            'code' => 'required|string|unique:teachers',
            'name' => 'required|string',
            'department_id' => 'required|exists:departments,id',
            'degree' => 'required|in:Undergraduate,Masters,PhD',
            'domain_group_id' => 'required|exists:domain_groups,id',
            'specialization_id' => 'nullable|exists:domains,id',
            'custom_specialization' => 'nullable|string',
            'experience_years' => 'required|integer|min:0',
            'min_hours' => 'required|integer|min:1',
            'max_hours' => 'required|integer|gte:min_hours',
            // Arrays for Checkboxes
            'availability_days' => 'required|array',
            'shift_preferences' => 'required|array|min:2', // Enforcing your "at least 2" rule
        ]);

        // 2. Save to Database
        Teacher::create($validated);

        // 3. Return a success response back to React
        return redirect()->route('teachers.index')->with('success', 'Teacher added successfully.');
    }

    /**
     * Delete a Teacher
     */
    public function destroy(Teacher $teacher)
    {
        $teacher->delete();
        return redirect()->route('teachers.index')->with('success', 'Teacher removed.');
    }
}
