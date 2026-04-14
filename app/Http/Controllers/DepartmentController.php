<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{



    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //

        $departments = Department::with('programs')->get();
        return Inertia::render('Acedemics/Index', [
            'departments' => $departments
        ]);
    }

    public function store(Request $request)
    {
        $departmentData = $request->validate([
            'department_code' => 'required|unique:departments,department_code',
            'department_name' => 'required',
        ]);

        Department::create($departmentData);

        return redirect()->back()->with('success', 'Department Created');
    }

    /**
     * Display the specified resource.
     */


    /**
     * Show the form for editing the specified resource.
     */


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Department $department)
    {
        $departmentData = $request->validate([
            'department_code' => 'required|unique:departments,department_code,' . $department->id,
            'department_name' => 'required',
        ]);

        $department->update($departmentData);

        return redirect()->back()->with('success', 'Department Updated');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Department $department)
    {
        //
        $department->delete();
        return redirect()->back()->with('success', "Department Deleted.");
    }
}
