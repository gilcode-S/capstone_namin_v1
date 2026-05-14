<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Programs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    //

    public function index()
    {
        return Inertia::render('Programs/Index', [
            'programs' => Programs::with('department')->latest()->get(),
            'departments' => Department::all(),
        ]);
    }


    public function store(Request $request)
    {
        // validation
        $validated = $request->validate([
            'name' => 'required|unique:programs,name',
            'code' => 'required|unique:programs,code',
            'department_id' => 'required|exists:departments,id'
        ]);


        Programs::create($validated);
        return redirect()->back()->with('success', 'Program Created');
    }


    public function update(Request $request, Programs $program)
    {
        // validation
        $validated = $request->validate([
            'name' => 'required|unique:programs,name,' . $program->id,
            'code' => 'required|unique:programs,code,' . $program->id,
            'department_id' => 'required|exists:departments,id'
        ]);


        $program->update($validated);
        return redirect()->back()->with('success', 'Program Updated');
    }

    public function destroy(Programs $program)
    {
        $program->delete();
        return redirect()->back()->with('success', 'Program Deleted');
    }
}
