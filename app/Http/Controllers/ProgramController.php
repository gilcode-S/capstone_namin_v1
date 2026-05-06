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
            'department_id' => 'required|exists:departments,id',
            'code' => 'required|unique:programs,code',
            'name' => 'required'
        ]);


        Programs::create($validated);
        return redirect()->back()->with('success', 'Program Created');
    }


    public function update(Request $request, Programs $program)
    {
        // validation
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'code' => 'required|unique:programs,code,' . $program->id,
            'name' => 'required'
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
