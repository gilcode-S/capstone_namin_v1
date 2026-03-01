<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacultyController extends Controller
{
    //
    public function index()
    {
        return Inertia::render('Facultys/Index', [
            'faculties' => Faculty::with(['department', 'availabilities'])->get(),
            'departments' => Department::all(),
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'faculty_code' => 'required|unique:faculties',
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email|unique:faculties',
            'employement_type' => 'required',
            'max_load_units' => 'required',
            'status' => 'required',
            'availabilities' => 'array'
        ]);

        $faculty = Faculty::create($validated);

        if ($request->availabilities) {
            foreach ($request->availabilities as $slot) {
                $faculty->availabilities()->create($slot);
            }
        }

        return redirect()->back()->with('success', 'Faculty created');
    }


    public function update(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'faculty_code' => 'required|unique:faculties,faculty_code,' . $faculty->id,
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email|unique:faculties,email,' . $faculty->id,
            'employement_type' => 'required',
            'max_load_units' => 'required',
            'status' => 'required',
            'availabilities' => 'array'
        ]);

        $faculty->update($validated);
        $faculty->availabilities()->delete();
        if ($request->availabilities) {
            foreach ($request->availabilities as $slot) {
                $faculty->availabilities()->create($slot);
            }
        }

        return redirect()->back()->with('success', 'Faculty updated');
    }

    public function destroy(Faculty $faculty)
    {
        $faculty->delete();
        return redirect()->back()->with('success', 'Faculty Deleted');
    }
}
