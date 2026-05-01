<?php

namespace App\Http\Controllers;

use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeSlotController extends Controller
{
    //

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
            'timeSlots' => TimeSlot::orderBy('day_of_week')->orderBy('start_time')->paginate(20),
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'day_of_week' => 'required',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'shift' => 'required|in:morning,afternoon,evening',
        ]);

        // $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // foreach ($days as $day) {
        //     TimeSlot::create([
        //         'day_of_week' => $day,
        //         'start_time' => $validated['start_time'],
        //         'end_time' => $validated['end_time'],
        //         'shift' => $validated['shift'],
        //         'status' => 'active'
        //     ]);
        // }

        TimeSlot::create([
            'day_of_week' => $validated['day_of_week'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'shift' => $this->getShift($validated['start_time']),
            'status' => 'active'
        ]);

        return back()->with('success', 'Timeslots generated for all days');
    }

    public function update(Request $request, TimeSlot $timeSlot)
    {
        $validated = $request->validate([
            'day_of_week' => 'nullable',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'shift' => 'required|in:morning,afternoon,evening',
            'status' => 'nullable|in:active,inactive'
        ]);


        $timeSlot->update($validated);

        return redirect()->back()->with('success', 'time slot updated');
    }


    public function destroy(TimeSlot $timeSlot)
    {
        $timeSlot->delete();

        return redirect()->back()->with('success', 'time slot deleted');
    }
}
