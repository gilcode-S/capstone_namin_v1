<?php

use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'role:super admin,registrar'])
    ->resource('department', DepartmentController::class);
Route::middleware(['auth', 'role:super admin,registrar'])
    ->resource('program', ProgramController::class);
Route::middleware(['auth', 'role:super admin,registrar'])
    ->resource('section', SectionController::class);
Route::middleware(['auth', 'role:super admin,registrar'])
    ->resource('subject', SubjectController::class);



Route::middleware(['auth', 'role:hr,super admin'])
    ->resource('faculty', FacultyController::class);

Route::middleware(['auth', 'role:registrar,super admin'])
    ->resource('rooms', RoomController::class);


require __DIR__ . '/settings.php';
