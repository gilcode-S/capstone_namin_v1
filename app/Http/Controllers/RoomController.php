<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\Department;
class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return Inertia::render('Rooms/Index', [
            'rooms' => Room::with('department')->paginate(15),
            'departments' => Department::all(),
        ]);
    }    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $validated = $request->validate([
            'room_name' => 'required|string|max:50|unique:rooms,room_name',
            'room_type' => 'required|in:lecture,laboratory',
            'capacity' => 'required|integer|min:1',
            'department_id' => 'required|exists:departments,id',
            'status' => 'required|in:active, inactive'
        ]);

        Room::create($validated);

        return redirect()->back()->with('success', 'Room Created');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'room_name' => 'required|string|max:50|unique:rooms,room_name,' . $room->id,
            'room_type' => 'required|in:lecture,laboratory',
            'capacity' => 'required|integer|min:1',
            'department_id' => 'required|exists:departments,id',
            'status' => 'required|in:active,inactive'
        ]);

        $room->update($validated);

        return redirect()->back()->with('success', 'Room updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        //

        $room->delete();

        return redirect()->back()->with('success', "Room deleted");
    }
}
