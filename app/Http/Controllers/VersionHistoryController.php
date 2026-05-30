<?php

namespace App\Http\Controllers;

use App\Models\ScheduleVersion;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VersionHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = ScheduleVersion::query()
            ->orderBy('created_at', 'desc');

        if ($request->academic_year) {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->semester) {
            $query->where('semester', $request->semester);
        }

        $versions = $query->get();

        return Inertia::render('Versions/Index', [
            'versions' => $versions,
            'filters' => $request->only(['academic_year', 'semester'])
        ]);
    }

    /**
     * CREATE VERSION
     */
    public function store(Request $request)
    {
        $version = ScheduleVersion::create([
            'name' => $request->name,
            'academic_year' => $request->academic_year,
            'semester' => $request->semester,
            'status' => 'Archived'
        ]);

        AuditLogService::created(
            'Schedule Version',
            "Created version: {$version->name} ({$version->academic_year} - {$version->semester})"
        );

        return back()->with('success', 'Version created successfully.');
    }

    /**
     * ACTIVATE VERSION
     */
    public function activate(ScheduleVersion $version)
    {
        // If already active
        if ($version->status === 'Active') {
            return back()->with('success', 'Version already active.');
        }

        // Find current active version
        $previousActive = ScheduleVersion::where('status', 'Active')->first();

        // Archive old active version
        if ($previousActive) {
            $previousActive->update([
                'status' => 'Archived'
            ]);

            AuditLogService::updated(
                'Schedule Version',
                "Archived version: {$previousActive->name} ({$previousActive->academic_year} - {$previousActive->semester})"
            );
        }

        // Activate new version
        $version->update([
            'status' => 'Active'
        ]);

        AuditLogService::updated(
            'Schedule Version',
            "Activated version: {$version->name} ({$version->academic_year} - {$version->semester})"
        );

        return back()->with('success', 'Version activated successfully.');
    }

    /**
     * DELETE VERSION (optional but good to log)
     */
    public function destroy(ScheduleVersion $version)
    {
        AuditLogService::deleted(
            'Schedule Version',
            "Deleted version: {$version->name} ({$version->academic_year} - {$version->semester})"
        );

        $version->delete();

        return back()->with('success', 'Version deleted successfully.');
    }
}