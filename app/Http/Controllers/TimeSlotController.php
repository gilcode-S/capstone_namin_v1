<?php

namespace App\Http\Controllers;

use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeSlotController extends Controller
{
    //

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
            'status' => 'required|in:active, inactive'
        ]);

        TimeSlot::create($validated);

        return redirect()->back()->with('success', 'time slot created');
    }

    public function update(Request $request, TimeSlot $timeSlot)
    {
        $validated = $request->validate([
            'day_of_week' => 'required',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'shift' => 'required|in:morning,afternoon,evening',
            'status' => 'required|in:active,inactive'
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
