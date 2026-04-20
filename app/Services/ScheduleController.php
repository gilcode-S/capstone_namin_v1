<?php

namespace App\Http\Controllers;

use App\Services\ConflictDetectionService;
use App\Services\ConflictResolutionService;

class ScheduleController extends Controller
{
    /**
     * 🔥 DETECT + RESOLVE CONFLICTS
     */
    public function resolveConflicts(
        $versionId,
        ConflictDetectionService $detector,
        ConflictResolutionService $resolver
    ) {
        // STEP 1: Detect all conflicts for this version
        $conflicts = $detector->detect($versionId);

        // STEP 2: Auto-resolve conflicts
        $resolved = $resolver->resolve($conflicts);

        // STEP 3: Return result (for UI or API)
        return response()->json([
            'message' => 'Conflict processing completed',
            'version_id' => $versionId,
            'conflicts_found' => $conflicts,
            'resolved' => $resolved
        ]);
    }
}