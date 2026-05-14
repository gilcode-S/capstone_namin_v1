<?php

use App\Http\Controllers\AnalyticController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ConflictController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\GenerateController;
use App\Http\Controllers\GeneratorController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SetupController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ScheduleVersionController;
use App\Http\Controllers\SectionSubjectAssignmentController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TimeSlotController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VersionHistoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'role:super admin,registrar'])
    ->resource('department', DepartmentController::class);

Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
Route::middleware(['auth', 'role:super admin,registrar'])
    ->resource('program', ProgramController::class);
Route::middleware(['auth', 'role:super admin,registrar'])
    ->resource('section', SectionController::class);
Route::get('/subjects', [SubjectController::class, 'index'])->name('subjects.index');
Route::post('/subjects', [SubjectController::class, 'store'])->name('subjects.store');
Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy'])->name('subjects.destroy');
Route::put('/subjects/{subject}', [SubjectController::class, 'update']);

// Route::post('/assignments/auto-assign', [SectionSubjectAssignmentController::class, 'autoAssign']);

Route::resource('assignments', SectionSubjectAssignmentController::class);

Route::delete('/curriculum/semester', [CurriculumController::class, 'destroySemester']);
// Route::post('/assignments/auto-assign', [SectionSubjectAssignmentController::class, 'autoAssign']);
// Route::middleware(['auth', 'role:super admin,registrar'])
//     ->resource('assignments', SectionSubjectAssignmentController::class);
Route::middleware(['auth', 'role:super admin,registrar,staff'])
    ->resource('curriculum', CurriculumController::class);
Route::get('/academics', [DepartmentController::class, 'index']);

Route::middleware(['auth', 'role:hr,super admin'])
    ->resource('faculty', FacultyController::class);
Route::middleware(['auth', 'role:staff,super admin,registrar'])
    ->resource('rooms', RoomController::class);
Route::middleware(['auth', 'role:staff,super admin'])
    ->resource('time-slots', TimeSlotController::class);
Route::middleware(['auth', 'role:staff,super admin'])
    ->resource('semesters', controller: SemesterController::class);
// Route::middleware(['auth', 'role:staff,super admin'])
//     ->resource('schedules', controller: ScheduleController::class);


// PAGE 14: User Management (Strictly locked to Super Admins)
Route::middleware(['auth', 'role:super admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});


Route::middleware(['auth', 'role:staff,super admin'])->group(function () {

    // GENERATE UI
    Route::get('/generate-schedule', [GenerateController::class, 'index'])
        ->name('generate.index');
    Route::post('/schedules/generate', [GenerateController::class, 'generate'])
        ->name('generate.schedule');
    Route::post('/schedules/reset/{versionId}', [GenerateController::class, 'reset'])
        ->name('schedules.reset');
    // ✅ FIXED: VIEW CONFLICTS (needs versionId)


    // PAGE 5: TEACHER MANAGEMENT
    // This single line creates all standard routes (index, store, update, destroy)
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // PAGE 9 & 10: SCHEDULE GENERATION
    // Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
    // Route::get('/schedules/generate', [ScheduleController::class, 'create'])->name('schedules.create');

    // // The endpoint your React app will hit when the admin clicks "Generate Schedule"
    // Route::post('/schedules/generate', [ScheduleController::class, 'generate'])->name('schedules.generate');


    Route::get('/conflicts', [App\Http\Controllers\ConflictController::class, 'index'])->name('conflicts.index');


    Route::get('/version-history', [VersionHistoryController::class, 'index'])->name('versions.index');

    // RESOLVE CONFLICTS
    // Route::post('/conflicts/{versionId}/resolve', [ConflictController::class, 'resolve'])
    //     ->name('conflicts.resolve');
});


Route::middleware(['auth', 'role:super admin,staff'])->group(function () {
    // Page 9: The Pre-Flight Dashboard
    Route::get('/schedules/generator', [GeneratorController::class, 'index'])->name('generator.index');

    // The Execution API (Runs the math, then redirects)
    Route::post('/schedules/generate', [GeneratorController::class, 'generate'])->name('generator.execute');

    // Page 8: The Schedule Viewer
    Route::get('/schedules/viewer', [ScheduleController::class, 'index'])->name('schedules.viewer');
    Route::delete('/schedules/reset', [GeneratorController::class, 'reset'])
        ->name('schedules.reset');
    Route::put('/schedules/{schedule}', [ScheduleController::class, 'update'])
        ->name('schedules.update');

    Route::get('/conflicts', [ConflictController::class, 'index'])->name('conflicts.index');
    Route::post('/conflicts/scan', [ConflictController::class, 'scan'])->name('conflicts.scan');
    Route::post('/conflicts/auto-resolve', [ConflictController::class, 'autoResolve'])->name('conflicts.auto-resolve');
});

// Route::get('/conflicts', function () {
//     $version = \App\Models\ScheduleVersion::where('is_active', 1)->first();

//     return redirect("/conflicts/{$version->id}");
// });

// Route::get('/conflicts/{versionId}', [ConflictController::class, 'index']);

Route::post('/generate-schedule', [GenerateController::class, 'generateSchedule']);
Route::post('/generate-final-schedule', [GenerateController::class, 'generateFinal']);

Route::post('/create-new-version', [GenerateController::class, 'createNewVersion']);
// 🔘 BUTTON 1
Route::post('/setup/rank-teachers', [SetupController::class, 'rankTeachers']);

// 🔘 BUTTON 2
Route::post('/setup/fetch-curriculum', [SetupController::class, 'fetchCurriculum']);

// 🔘 BUTTON 3
Route::post('/setup/lock-rooms', [SetupController::class, 'lockRooms']);



// Route::post('/generate-units/{sectionId}', function (
//     $sectionId,
//     \App\Services\CurriculumToSchedulingService $service
// ) {

//     $service->generateSchedulingUnits($sectionId);

//     return back()->with('success', 'Scheduling units generated');
// });


Route::middleware(['auth', 'role:staff,super admin'])
    ->get('/schedule-versions', [ScheduleVersionController::class, 'index']);
Route::middleware(['auth', 'role:staff,super admin'])
    ->post('/schedule-versions', [ScheduleVersionController::class, 'store']);
Route::middleware(['auth', 'role:staff,super admin'])
    ->put('/schedule-versions/{scheduleVersion}/active', [ScheduleVersionController::class, 'active']);
Route::middleware(['auth', 'role:staff,super admin'])
    ->delete('/schedule-versions/{scheduleVersion}', [ScheduleVersionController::class, 'destroy']);


// routes generate and reset :D 
Route::middleware(['auth', 'role:staff,super admin'])
    ->post('/schedules/generate/{version}', [ScheduleController::class, 'generate'])->name('schedule.generate');
Route::middleware(['auth', 'role:staff,super admin'])
    ->post('/schedules/reset/{version}', [ScheduleController::class, 'reset'])->name('schedule.reset');
require __DIR__ . '/settings.php';
