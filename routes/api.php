<?php

use App\Services\TeacherRankingService;
use App\Http\Controllers\ScheduleController;
use App\Services\CurriculumToSchedulingService;
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
