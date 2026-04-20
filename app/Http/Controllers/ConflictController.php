<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\ScheduleVersion;
use App\Services\ConflictDetectionService;
use App\Services\ConflictResolutionService;

class ConflictController extends Controller
{
    /**
     * VIEW CONFLICTS (UI)
     */
    public function index($versionId, ConflictDetectionService $conflictService)
    {
        $version = ScheduleVersion::findOrFail($versionId);

        $conflicts = $conflictService->detect($versionId);

        return Inertia::render('Schedules/Conflicts', [
            'conflicts' => $conflicts,
            'versionId' => $versionId
        ]);
    }

    /**
     * AUTO RESOLVE CONFLICTS (ACTION)
     */
    public function resolve(
        $versionId,
        ConflictDetectionService $detector,
        ConflictResolutionService $resolver
    ) {
        $conflicts = $detector->detect($versionId);

        $fixed = $resolver->resolve($conflicts);

        return response()->json([
            'message' => 'Conflicts resolved successfully',
            'fixed' => $fixed
        ]);
    }
}