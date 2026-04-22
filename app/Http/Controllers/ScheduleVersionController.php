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
    public function index(Request $request)
    {
        $query = ScheduleVersion::with(['semester', 'creator']);

        // FILTERS
        if ($request->filled('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        if ($request->filled('school_year')) {
            $query->whereHas('semester', function ($q) use ($request) {
                $q->where('school_year', $request->school_year);
            });
        }
        if ($request->filled('version_id')) {
            $query->where('schedule_version_id', $request->version_id);
        }

        return Inertia::render("ScheduleVersions/Index", [
            'versions' => $query->latest()->get(),
            'semesters' => Semester::all(),

            'filters' => $request->only([
                'semester_id',
                'school_year'
            ])
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
