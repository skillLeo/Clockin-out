<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Individual;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Assignments', [
            'assignments' => Assignment::with(['staff:id,name', 'individual:id,name', 'service:id,name'])
                ->withCount('visits')
                ->latest('date')
                ->latest('id')
                ->take(100)
                ->get(),
            'staff' => User::where('role', 'staff')->where('active', true)->orderBy('name')->get(['id', 'name']),
            'individuals' => Individual::orderBy('name')->get(['id', 'name']),
            'services' => Service::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'staff_id'     => 'required|exists:users,id',
            'individual_id'=> 'required|exists:individuals,id',
            'service_id'   => 'required|exists:services,id',
            'date'         => 'required|date',
            'note'         => 'nullable|string|max:500',
        ]);

        $staff = User::findOrFail($validated['staff_id']);
        abort_unless($staff->isStaff() && $staff->active, 422, 'Selected user must be an active staff member.');

        $assignment = Assignment::create($validated)->load(['staff:id,name', 'individual:id,name', 'service:id,name']);
        $assignment->setAttribute('visits_count', 0);

        return response()->json(['assignment' => $assignment], 201);
    }

    public function update(Request $request, Assignment $assignment)
    {
        abort_if($assignment->visits()->exists(), 422, 'Assignments with started visits cannot be edited.');

        $validated = $request->validate([
            'staff_id'     => 'required|exists:users,id',
            'individual_id'=> 'required|exists:individuals,id',
            'service_id'   => 'required|exists:services,id',
            'date'         => 'required|date',
            'note'         => 'nullable|string|max:500',
        ]);

        $staff = User::findOrFail($validated['staff_id']);
        abort_unless($staff->isStaff() && $staff->active, 422, 'Selected user must be an active staff member.');

        $assignment->update($validated);
        $assignment->load(['staff:id,name', 'individual:id,name', 'service:id,name']);
        $assignment->setAttribute('visits_count', 0);

        return response()->json(['assignment' => $assignment]);
    }

    public function destroy(Assignment $assignment)
    {
        abort_if($assignment->visits()->exists(), 422, 'Assignments with started visits cannot be deleted.');

        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted.']);
    }
}
