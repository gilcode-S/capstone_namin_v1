<?php

namespace App\Http\Controllers;

use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeSlotController extends Controller
{
    private function getShift($time)
    {
        $hour = (int) explode(':', $time)[0];

        if ($hour < 12) return 'Morning';
        if ($hour < 18) return 'Afternoon';

        return 'Evening';
    }

    public function index()
    {
        return Inertia::render('TimeSlots/Index', [
            'timeSlots' => TimeSlot::orderByRaw("
                FIELD(day,
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday'
                )
            ")
            ->orderBy('start_time')
            ->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'day' => 'required|string',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
        ]);

        TimeSlot::create([
            'day' => $validated['day'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'shift' => $this->getShift($validated['start_time']),
        ]);

        return back()->with('success', 'Timeslot created successfully');
    }

    public function update(Request $request, TimeSlot $timeSlot)
    {
        $validated = $request->validate([
            'day' => 'required|string',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
        ]);

        $timeSlot->update([
            'day' => $validated['day'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'shift' => $this->getShift($validated['start_time']),
        ]);

        return back()->with('success', 'Timeslot updated successfully');
    }

    public function destroy(TimeSlot $timeSlot)
    {
        $timeSlot->delete();

        return back()->with('success', 'Timeslot deleted successfully');
    }
}