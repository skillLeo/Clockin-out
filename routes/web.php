<?php

use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\Staff\VisitController as StaffVisitController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\AdminVisitController;
use App\Http\Controllers\Admin\PayrollController;
use App\Http\Controllers\Admin\AiSettingsController;
use App\Http\Controllers\Admin\BrandingController;
use App\Http\Controllers\Admin\AssignmentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('login'));

Route::middleware('auth')->get('/dashboard', function () {
    return auth()->user()->role === 'admin'
        ? redirect()->route('admin.dashboard')
        : redirect()->route('staff.dashboard');
})->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'auth.staff'])->prefix('staff')->name('staff.')->group(function () {
    Route::get('/', [StaffDashboardController::class, 'index'])->name('dashboard');
    Route::get('/visits', [StaffVisitController::class, 'index'])->name('visits.index');
    Route::get('/visit/{visit}', [StaffVisitController::class, 'show'])->name('visit.show');
    Route::get('/visit/{visit}/review', [StaffVisitController::class, 'review'])->name('visit.review');
});

Route::middleware(['auth', 'auth.admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/assignments', fn () => redirect()->route('admin.visits.index'))->name('assignments.index');
    Route::get('/visits', [AdminVisitController::class, 'index'])->name('visits.index');
    Route::get('/visit/{visit}', [AdminVisitController::class, 'show'])->name('visit.show');
    Route::get('/payroll', [PayrollController::class, 'index'])->name('payroll.index');
    Route::get('/ai-settings', [AiSettingsController::class, 'index'])->name('ai-settings.index');
    Route::get('/branding',    [BrandingController::class, 'index'])->name('branding.index');
});

require __DIR__.'/auth.php';
