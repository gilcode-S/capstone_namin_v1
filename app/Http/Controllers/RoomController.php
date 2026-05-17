<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\Department;
use App\Services\AuditLogService;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $query = Room::query()->orderBy('generated_name', 'asc');
        $query = Room::with([
            'schedules.timeslot'
        ])->orderBy('generated_name', 'asc');

        // TYPE FILTER
        if ($request->type) {
            $query->where('type', $request->type);
        }

        // BUILDING FILTER
        if ($request->building) {
            $query->where('building', $request->building);
        }

        // FLOOR FILTER
        if ($request->floor) {
            $query->where('floor', $request->floor);
        }

        return Inertia::render('Rooms/Index', [
            'rooms' => $query->paginate(15)->withQueryString(),

            'departments' => Department::all(),

            'stats' => [
                'total' => Room::count(),
            ],

            'filters' => [
                'type' => $request->type,
                'building' => $request->building,
                'floor' => $request->floor,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'building' => 'required|string',
            'floor' => 'required|integer',
            'room_number' => [
                'required',
                Rule::unique('rooms')
                    ->where(function ($query) use ($request) {
                        return $query
                            ->where('building', $request->building)
                            ->where('floor', $request->floor);
                    }),
            ],

            'description_name' => 'nullable|string',
            'type' => 'required|in:Classroom,Lab,PE,Online',
            'capacity' => 'required|integer|min:1',
            'equipment' => 'nullable|array',
        ]);
        $validated['equipment'] = $validated['equipment'] ?? [];
        $room = Room::create($validated);

        AuditLogService::created(
            'Room',
            "Created room: {$room->name} (Capacity: {$room->capacity})"
        );

        return back()->with('success', 'Room Created');
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'building' => 'required|string',
            'floor' => 'required|integer',
            'room_number' => [
                'required',
                Rule::unique('rooms')
                    ->ignore($room->id)
                    ->where(function ($query) use ($request) {
                        return $query
                            ->where('building', $request->building)
                            ->where('floor', $request->floor);
                    }),
            ],
            'description_name' => 'nullable|string',

            'type' => 'required|in:Classroom,Lab,PE,Online',
            'capacity' => 'required|integer|min:1',

            'equipment' => 'nullable|array',
        ]);
        $validated['equipment'] = $validated['equipment'] ?? [];

        $room->update($validated);
        AuditLogService::updated(
            'Room',
            "Updated room: {$room->name} (Capacity: {$room->capacity})"
        );


        return back()->with('success', 'Room updated successfully.');
    }

    public function destroy(Room $room)
    {
        $room->delete();

        AuditLogService::deleted(
            'Room',
            "Deleted room: {$room->name}"
        );
        return back()->with('success', "Room deleted");
    }
}
