<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Faculty;
use App\Models\Shift;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacultyController extends Controller
{
    public function index(Request $request)
    {
        $query = Faculty::with([
            'department',
            'schedules.timeslot',
            'schedules.subject',
            'schedules.room',
            'availabilities',
            'shifts'
        ]);

        // SEARCH
        if ($request->search) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                    ->orWhere('last_name', 'like', "%$search%")
                    ->orWhereHas('schedules.subject', function ($q2) use ($search) {
                        $q2->where('subject_name', 'like', "%$search%");
                    });
            });
        }

        // FILTER BY DEPARTMENT
        if ($request->department) {
            $query->where('department_id', $request->department);
        }

        $faculties = $query->paginate(15)->withQueryString();

        // ==============================
        // 🔥 AVERAGE WORKLOAD CALC
        // ==============================
        $avgLoad = $faculties->getCollection()->avg(function ($f) {

            $validSchedules = $f->schedules->filter(function ($s) {
                return $s->timeslot &&
                    strtotime($s->timeslot->end_time) > strtotime($s->timeslot->start_time);
            });

            $totalMinutes = $validSchedules->sum(function ($s) {
                $start = strtotime($s->timeslot->start_time);
                $end = strtotime($s->timeslot->end_time);
                return ($end - $start) / 60;
            });

            $hours = round($totalMinutes / 60, 1);

            $maxLoad = $f->max_load_units > 0 ? $f->max_load_units : 21;

            return $maxLoad > 0
                ? min(100, ($hours / $maxLoad) * 100)
                : 0;
        });

        return Inertia::render('Facultys/Index', [
            'faculties' => $faculties->through(function ($f) {

                // VALID SCHEDULES
                $validSchedules = $f->schedules->filter(function ($s) {
                    return $s->timeslot &&
                        strtotime($s->timeslot->end_time) > strtotime($s->timeslot->start_time);
                });

                // HOURS
                $totalMinutes = $validSchedules->sum(function ($s) {
                    $start = strtotime($s->timeslot->start_time);
                    $end = strtotime($s->timeslot->end_time);
                    return ($end - $start) / 60;
                });

                $hours = round($totalMinutes / 60, 1);

                // MAX LOAD
                $maxLoad = $f->max_load_units > 0 ? $f->max_load_units : 21;

                // WORKLOAD %
                $workload = $maxLoad > 0
                    ? min(100, round(($hours / $maxLoad) * 100))
                    : 0;

                // SUBJECTS (FROM SCHEDULE — FIXED)
                $subjects = Schedule::with('subject')
                    ->where('faculty_id', $f->id)
                    ->get()
                    ->pluck('subject.subject_name')
                    ->filter()
                    ->unique()
                    ->values();

                // DAYS
                $days = $validSchedules
                    ->pluck('timeslot.day_of_week')
                    ->filter()
                    ->unique()
                    ->values();

                // AVAILABILITY
                $availability = $f->availabilities->map(function ($a) {
                    return [
                        'day_of_week' => $a->day_of_week,
                        'start_time' => $a->start_time,
                        'end_time' => $a->end_time,
                    ];
                })->values();

                // SCHEDULE FORMAT
                $schedule = $validSchedules->map(function ($s) {
                    return [
                        'day' => $s->timeslot->day_of_week ?? null,
                        'start_time' => $s->timeslot->start_time ?? null,
                        'end_time' => $s->timeslot->end_time ?? null,
                        'subject' => $s->subject->subject_name ?? 'N/A',
                        'room' => $s->room->room_name ?? 'N/A',
                    ];
                })->values();

                return [
                    ...$f->toArray(),

                    'assigned_load' => $hours,
                    'workload_percent' => $workload,

                    'subjects' => $subjects,
                    'teaching_days' => $days,

                    'availability_full' => $availability,
                    'schedule_full' => $schedule,
                ];
            }),

            'departments' => Department::all(),

            'filters' => [
                'search' => $request->search,
                'department' => $request->department
            ],

            'stats' => [
                'total' => Faculty::count(),
                'subjects' => \App\Models\Subject::count(),
                'avg_load' => round($avgLoad, 1), // ✅ FIXED HERE
            ],

            'shifts' => Shift::all(),
        ]);
    }

    // ===========================
    // STORE
    // ===========================
    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'faculty_code' => 'required|unique:faculties,faculty_code',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:faculties,email',
            'employment_type' => 'nullable',
            'max_load_units' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',

            'availability' => 'nullable|array',
            'availability.*' => 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',

            'shifts' => 'nullable|array',
            'shifts.*' => 'exists:shifts,id',

            'qualification_level' => 'nullable|string',
            'years_experience' => 'nullable|integer|min:0',

            'degree' => 'nullable|in:Bachelor,Master,PhD',
            'domains' => 'nullable|array',
            'domains.*' => 'string',
        ]);

        $faculty = Faculty::create($validated);

        if ($request->availability) {
            foreach ($request->availability as $day) {
                $faculty->availabilities()->create([
                    'day_of_week' => $day,
                    'start_time' => '08:00',
                    'end_time' => '17:00',
                ]);
            }
        }

        $faculty->shifts()->sync($request->shifts ?? []);

        return redirect()->back()->with('success', 'Faculty created');
    }

    // ===========================
    // UPDATE
    // ===========================
    public function update(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'faculty_code' => 'required|unique:faculties,faculty_code,' . $faculty->id,
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:faculties,email,' . $faculty->id,
            'employment_type' => 'nullable',
            'max_load_units' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',

            'availability' => 'nullable|array',
            'availability.*' => 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',

            'shifts' => 'nullable|array',
            'shifts.*' => 'exists:shifts,id',

            'qualification_level' => 'nullable|string',
            'years_experience' => 'nullable|integer|min:0',

            'degree' => 'nullable|in:Bachelor,Master,PhD',
            'domains' => 'nullable|array',
            'domains.*' => 'string',
        ]);

        $faculty->update($validated);

        $faculty->availabilities()->delete();

        if ($request->availability) {
            foreach ($request->availability as $day) {
                $faculty->availabilities()->create([
                    'day_of_week' => $day,
                    'start_time' => '08:00',
                    'end_time' => '17:00',
                ]);
            }
        }

        $faculty->shifts()->sync($request->shifts ?? []);

        return redirect()->back()->with('success', 'Faculty updated');
    }

    // ===========================
    // DELETE
    // ===========================
    public function destroy(Faculty $faculty)
    {
        $faculty->delete();
        return redirect()->back()->with('success', 'Faculty Deleted');
    }
}