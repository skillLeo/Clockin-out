<?php

use App\Http\Controllers\Api\VisitController;
use App\Http\Controllers\Api\AiNoteController;
use App\Http\Controllers\Api\AdminVisitController;
use App\Http\Controllers\Admin\PayrollController;
use App\Http\Controllers\Admin\AiSettingsController;
use App\Http\Controllers\Admin\BrandingController;
use App\Http\Controllers\Admin\AssignmentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'auth.staff'])->group(function () {
    Route::post('/visit/start',     [VisitController::class, 'start']);
    Route::post('/visit/end',       [VisitController::class, 'end']);
    Route::post('/visit/save-note', [VisitController::class, 'saveNote']);
    Route::post('/visit/submit',    [VisitController::class, 'submit']);
    Route::post('/ai/process-note', [AiNoteController::class, 'process']);
});

Route::middleware(['auth:sanctum', 'auth.admin'])->group(function () {
    Route::post('/admin/visit/approve',       [AdminVisitController::class, 'approve']);
    Route::post('/admin/visit/reject',        [AdminVisitController::class, 'reject']);
    Route::post('/admin/visit/update-notes',  [AdminVisitController::class, 'updateNotes']);
    Route::get('/admin/payroll/preview', [PayrollController::class, 'preview']);
    Route::get('/admin/payroll/export',  [PayrollController::class, 'export']);
    Route::post('/admin/ai-settings',    [AiSettingsController::class, 'update']);
    Route::post('/admin/branding',            [BrandingController::class, 'update']);
    Route::post('/admin/branding/logo',       [BrandingController::class, 'uploadLogo']);
    Route::delete('/admin/branding/logo',     [BrandingController::class, 'removeLogo']);
    Route::post('/admin/assignments',    [AssignmentController::class, 'store']);
    Route::put('/admin/assignments/{assignment}', [AssignmentController::class, 'update']);
    Route::delete('/admin/assignments/{assignment}', [AssignmentController::class, 'destroy']);
});
