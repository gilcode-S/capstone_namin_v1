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
        $query = Room::with([
            'schedules.timeslot'
        ])->orderBy('generated_name', 'asc');

        /**
         * TYPE FILTER
         */
        if ($request->type) {
            $query->where('type', $request->type);
        }

        /**
         * BUILDING FILTER
         */
        if ($request->building) {
            $query->where('building', $request->building);
        }

        /**
         * FLOOR FILTER
         */
        if ($request->floor) {
            $query->where('floor', $request->floor);
        }

        /**
         * PAGINATED ROOMS
         */
        $rooms = $query
            ->paginate(15)
            ->withQueryString();

        /**
         * PAGE UTILIZATION
         * (FOR DISPLAY ONLY)
         */
        $rooms->getCollection()->transform(function ($room) {

            $scheduleCount = $room->schedules->count();

            $room->utilization_percent = min(
                100,
                round(($scheduleCount / 40) * 100)
            );

            return $room;
        });

        /**
         * GLOBAL ANALYTICS
         * USE ALL FILTERED ROOMS
         * NOT JUST CURRENT PAGE
         */
        $analyticsQuery = Room::with([
            'schedules.timeslot'
        ]);

        /**
         * APPLY SAME FILTERS
         */
        if ($request->type) {
            $analyticsQuery->where('type', $request->type);
        }

        if ($request->building) {
            $analyticsQuery->where('building', $request->building);
        }

        if ($request->floor) {
            $analyticsQuery->where('floor', $request->floor);
        }

        $allRooms = $analyticsQuery->get();

        $totalIdle = 0;
        $totalUtilization = 0;

        foreach ($allRooms as $room) {

            /**
             * UTILIZATION %
             */
            $scheduleCount = $room->schedules->count();

            $utilization = min(
                100,
                round(($scheduleCount / 40) * 100)
            );

            /**
             * IDLE %
             */
            $occupiedMinutes = 0;

            foreach ($room->schedules as $schedule) {

                if (!$schedule->timeslot) {
                    continue;
                }

                $start = strtotime($schedule->timeslot->start_time);
                $end = strtotime($schedule->timeslot->end_time);

                if ($end > $start) {
                    $occupiedMinutes += ($end - $start) / 60;
                }
            }

            /**
             * 7AM - 7PM = 720 mins
             */
            $totalMinutes = 720;

            $idle = max(
                0,
                (($totalMinutes - $occupiedMinutes) / $totalMinutes) * 100
            );

            $totalIdle += $idle;
            $totalUtilization += $utilization;
        }

        /**
         * FINAL AVERAGES
         */
        $avgIdle = $allRooms->count()
            ? round($totalIdle / $allRooms->count(), 1)
            : 0;

        $avgUtilization = $allRooms->count()
            ? round($totalUtilization / $allRooms->count(), 1)
            : 0;

        return Inertia::render('Rooms/Index', [

            'rooms' => $rooms->through(function ($room) {

                return [
                    ...$room->toArray(),

                    'utilization_percent' =>
                    $room->utilization_percent,
                ];
            }),

            'departments' => Department::all(),

            'stats' => [
                'total' => $allRooms->count(),
                'avg_idle' => $avgIdle,
                'avg_utilization' => $avgUtilization,
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
            "Created room: {$room->generated_name} (Capacity: {$room->capacity})"
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
            "Updated room: {$room->generated_name} (Capacity: {$room->capacity})"
        );


        return back()->with('success', 'Room updated successfully.');
    }

    public function destroy(Room $room)
    {
        $room->delete();

        AuditLogService::deleted(
            'Room',
            "Deleted room: {$room->generated_name}"
        );
        return back()->with('success', "Room deleted");
    }
}
