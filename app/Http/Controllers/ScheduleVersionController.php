<?php

namespace App\Http\Controllers;

use App\Models\ScheduleVersion;
use App\Models\Semester;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduleVersionController extends Controller
{
    //  
    public function index()
    {
        return Inertia::render("ScheduleVersions/Index", [
            'versions' => ScheduleVersion::with(['semester', 'creator'])->orderByDesc('created_at')->get(),
            'semesters' => Semester::all(),
        ]);
    }


    public function store(Request $request)
    {
        $validate = $request->validate([
            'semester_id'  => 'required|exists:semesters,id',
        ]);

        // get the next version sched number
        $latest = ScheduleVersion::where('semester_id', $validate['semester_id'])->max('version_number');

        $nextVersion = $latest ? $latest + 1 : 1;

        ScheduleVersion::create([
            'semester_id' => $validate['semester_id'],
            'version_number' => $nextVersion,
            'created_by' => Auth::id(),
            'is_active' => false
        ]);

        return redirect()->back()->with('success', 'version created');
    }


    public function active(ScheduleVersion $scheduleVersion)
    {
        // Deactivate all versions of this semester
        ScheduleVersion::where('semester_id', $scheduleVersion->semester_id)
            ->update(['is_active' => false]);

        // Activate selected
        $scheduleVersion->update(['is_active' => true]);

        return redirect()->back()->with('success', 'Version activated.');
    }


    public function destroy(ScheduleVersion $scheduleVersion)
    {
        $scheduleVersion->delete();

        return redirect()->back()->with('success', 'version deleted');
    }
}
