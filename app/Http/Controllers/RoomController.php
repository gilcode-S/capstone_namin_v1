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
    public function index(Request $request)
    {
        //
        $query = Room::with([
            'department',
            'schedules.timeslot'
        ])->orderBy('room_name', 'asc');

        // ✅ STATUS FILTER
        if ($request->status) {
            $query->where(function ($q) use ($request) {
                $q->where('resource_status', $request->status)
                    ->orWhere(function ($q2) use ($request) {

                        // fallback for old data
                        if ($request->status === 'available') {
                            $q2->whereNull('resource_status')
                                ->where('status', 'active');
                        }

                        if ($request->status === 'maintenance') {
                            $q2->where('status', 'inactive');
                        }
                    });
            });
        }
        if ($request->type) {
            $query->where('resource_type', $request->type);
        }
        if ($request->tab && $request->tab !== 'utilization') {
            $query->where('resource_type', $request->tab);
        }

        return Inertia::render('Rooms/Index', [
            'rooms' => $query->paginate(15),
            'departments' => Department::all(),
            'stats' => [
                'total' => Room::count(),

                'available' => Room::where('resource_status', 'available')
                    ->orWhere(function ($q) {
                        $q->whereNull('resource_status')
                            ->where('status', 'active');
                    })->count(),

                'occupied' => Room::where('resource_status', 'occupied')->count(),

                'maintenance' => Room::where('resource_status', 'maintenance')
                    ->orWhere('status', 'inactive')
                    ->count(),
            ],
            'filters' => [
                'status' => $request->status,
                'type' => $request->type,
            ]
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

            // NEW
            'resource_type' => 'required|in:classroom,laboratory,pe_room',
            'capacity' => 'required|integer|min:1',
            'department_id' => 'nullable|exists:departments,id',

            'building' => 'nullable|string',
            'floor' => 'nullable|string',
            'equipment' => 'nullable|array',

            'resource_status' => 'required|in:available,occupied,maintenance'
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

            'resource_type' => 'required|in:classroom,laboratory,pe_room',
            'capacity' => 'required|integer|min:1',
            'department_id' => 'nullable|exists:departments,id',

            'building' => 'nullable|string',
            'floor' => 'nullable|string',
            'equipment' => 'nullable|array',

            'resource_status' => 'required|in:available,occupied,maintenance'
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
