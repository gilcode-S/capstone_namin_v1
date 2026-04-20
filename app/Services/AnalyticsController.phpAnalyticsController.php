<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsEngineService;

class AnalyticsController extends Controller
{
    /**
     * 📊 RETURN ANALYTICS SNAPSHOT
     */
    public function snapshot(AnalyticsEngineService $analytics)
    {
        // You can replace "1" with active version later
        $versionId = 1;

        $data = $analytics->generateSnapshot($versionId);

        return response()->json([
            'success' => true,
            'version_id' => $versionId,
            'data' => $data
        ]);
    }
}