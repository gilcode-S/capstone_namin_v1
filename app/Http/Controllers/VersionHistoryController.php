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
        if ($versions->isEmpty()) {
            $versions = collect([
                (object)[
                    'id' => 1,
                    'name' => '2026 - 2027 FIRST SEMESTER',
                    'academic_year' => '2026-2027',
                    'semester' => 'First',
                    'version_number' => 5,
                    'status' => 'Archived',
                    'created_at' => '2026-07-20T10:00:00.000000Z',
                    'effective_date' => '2026-08-20'
                ],
                (object)[
                    'id' => 2,
                    'name' => '2026 - 2027 FIRST SEMESTER',
                    'academic_year' => '2026-2027',
                    'semester' => 'First',
                    'version_number' => 4,
                    'status' => 'Archived',
                    'created_at' => '2026-07-15T10:00:00.000000Z',
                    'effective_date' => '2026-08-20'
                ],
                (object)[
                    'id' => 3,
                    'name' => '2025 - 2026 SECOND SEMESTER',
                    'academic_year' => '2025-2026',
                    'semester' => 'Second',
                    'version_number' => 2,
                    'status' => 'Active', // The current active schedule
                    'created_at' => '2025-12-10T10:00:00.000000Z',
                    'effective_date' => '2026-01-20'
                ]
            ]);
        }

        return Inertia::render('Versions/Index', [
            'versions' => $versions,
            'filters' => $request->only(['academic_year', 'semester'])
        ]);
    }
}