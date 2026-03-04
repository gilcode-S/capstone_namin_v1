<?php

namespace App\Http\Controllers;

use App\Models\Semester;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SemesterController extends Controller
{
    //

    public function index()
    {
        return Inertia::render('Semesters/Index', [
            'semesters' => Semester::orderBy('start_date', 'desc')->get()
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_year' => 'required|string|max:20',
            'term' => 'required|in:1st,2nd,summer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:upcoming,active,completed'
        ]);

        Semester::create($validated);

        return redirect()->back()->with('success', 'semester created');
    }

    public function update(Request $request, Semester $semester)
    {
        $validated = $request->validate([
            'school_year' => 'required|string|max:20',
            'term' => 'required|in:1st,2nd,summer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:upcoming,active,completed',
        ]);

        $semester->update($validated);

        return redirect()->back()->with('successs', 'semester updated');
    }


    public function destroy(Semester $semester)
    {
        $semester->delete();

        return redirect()->back()->with('successs', 'semester deleted');
    }
}
