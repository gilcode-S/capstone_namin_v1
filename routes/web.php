<?php

use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProgramController;
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



require __DIR__ . '/settings.php';
