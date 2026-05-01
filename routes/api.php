<?php

use App\Services\TeacherRankingService;
use App\Http\Controllers\ScheduleController;
use App\Services\CurriculumToSchedulingService;
use App\Services\ConflictDetectionService;
use App\Services\ConflictResolutionService;

use Illuminate\Support\Facades\Route;

// --------------------------------------------
// BUTTON 1: RANK TEACHERS
// --------------------------------------------
Route::post('/rank-teachers', function (TeacherRankingService $service) {

    // CALL RANKING
    $service->rank();

    return response()->json([
        'message' => 'Teacher ranking completed'
    ]);
});

// --------------------------------------------
// BUTTON 2: GENERATE SCHEDULING UNITS
// --------------------------------------------
Route::post('/generate-units/{sectionId}', function (
    $sectionId,
    CurriculumToSchedulingService $service
) {

    // CREATE SPLIT SUBJECTS
    $service->generateSchedulingUnits($sectionId);

    return response()->json([
        'message' => 'Scheduling units generated'
    ]);
});

Route::post('/generate-final-schedule', [ScheduleController::class, 'generateFinal']);
Route::post('/schedule/detect-conflicts/{versionId}', function ($versionId) {

    // run detection
    return app(ConflictDetectionService::class)->scan($versionId);
});

Route::post('/schedule/resolve-conflicts/{versionId}', function ($versionId) {

    // run auto fix
    app(ConflictResolutionService::class)->resolveAll($versionId);

    return response()->json([
        'message' => 'Conflicts resolved'
    ]);
});
