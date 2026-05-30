<?php

namespace App\Http\Controllers;

use App\Models\ScheduleVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VersionHistoryController extends Controller
{
    public function index(Request $request)
    {
        // Fetch from DB, filtering by year/sem if provided
        $query = ScheduleVersion::query()->orderBy('created_at', 'desc');

        if ($request->academic_year) {
            $query->where('academic_year', $request->academic_year);
        }
        if ($request->semester) {
            $query->where('semester', $request->semester);
        }

        $versions = $query->get();

        // If DB is empty, let's inject mock data so your UI matches the mockup immediately


        return Inertia::render('Versions/Index', [
            'versions' => $versions,
            'filters' => $request->only(['academic_year', 'semester'])
        ]);
    }

    public function activate(ScheduleVersion $version)
    {
        // Remove active status from all versions
        ScheduleVersion::where('status', 'Active')
            ->update([
                'status' => 'Archived'
            ]);

        // Activate selected version
        $version->update([
            'status' => 'Active'
        ]);

        return back()->with(
            'success',
            'Version activated successfully.'
        );
    }
}
