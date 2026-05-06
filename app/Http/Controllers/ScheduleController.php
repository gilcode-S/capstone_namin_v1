<?php

namespace App\Http\Controllers;

use App\Services\SetScheduleService;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Section;
use App\Models\TimeSlot;
use App\Services\ScheduleGeneratorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{




    public function index()
    {
        // Pull all schedules and their connected data
        $schedules = Schedule::with(['section.program', 'subject', 'teacher', 'room', 'timeslot'])->get();

        return Inertia::render('Schedules/Viewer', [
            'schedules' => $schedules
        ]);
    }

    public function generate(Request $request, ScheduleGeneratorService $algorithm)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id'
        ]);

        $section = Section::findOrFail($request->section_id);

        try {
            // FIRE THE ENGINE! 🚀
            $algorithm->generateScheduleForSection($section);

            return redirect()->route('schedules.index')
                ->with('success', "Schedule generated successfully for {$section->name}!");
        } catch (\Exception $e) {
            // If the algorithm fails (e.g., no competent teacher found), send the error to the UI
            return redirect()->back()
                ->with('error', "Generation Failed: " . $e->getMessage());
        }
    }

    /**
     * =====================================================
     * STORE
     * =====================================================
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_version_id' => 'required|exists:schedule_versions,id',
            'assignment_id' => 'required|exists:section_subject_assignments,id',
            'room_id' => 'required|exists:rooms,id',
            'time_slot_id' => 'required|exists:time_slots,id',
        ]);

        Schedule::create($validated);

        return redirect()
            ->back()
            ->with('success', 'Schedule created');
    }

    /**
     * =====================================================
     * UPDATE
     * =====================================================
     */
    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'time_slot_id' => 'required|exists:time_slots,id',
        ]);

        $schedule->update($validated);

        return back()->with(
            'success',
            'Schedule moved successfully'
        );
    }



    /**
     * =====================================================
     * DELETE
     * =====================================================
     */
    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return redirect()
            ->back()
            ->with('success', 'Schedule deleted');
    }
}
