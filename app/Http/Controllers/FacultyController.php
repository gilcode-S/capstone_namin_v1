<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Department;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacultyController extends Controller
{
    //
    public function index(Request $request)
    {
        $query = Faculty::with([
            'department',
            'assignments.subject',
            'schedules.timeslot'
        ]);
    
        
        if ($request->search) {
            $search = $request->search;
    
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                  ->orWhere('last_name', 'like', "%$search%")
                  ->orWhereHas('assignments.subject', function ($q2) use ($search) {
                      $q2->where('subject_name', 'like', "%$search%");
                  });
            });
        }
    
     
        if ($request->department) {
            $query->where('department_id', $request->department);
        }
    
        $faculties = $query->paginate(15)->withQueryString();

        return Inertia::render('Facultys/Index', [

            'faculties' => $faculties->through(function ($f) {
               
                $validSchedules = $f->schedules->filter(function ($s) {

                    if (!$s->timeslot) return false;
                
                    $start = Carbon::parse($s->timeslot->start_time);
                    $end = Carbon::parse($s->timeslot->end_time);
                
                    return $end->greaterThan($start);
                });
                
              
                $totalMinutes = $validSchedules->sum(function ($s) {
                
                    $start = Carbon::parse($s->timeslot->start_time);
                    $end = Carbon::parse($s->timeslot->end_time);
                
                    return $start->diffInMinutes($end); 
                });
                
              
                $hours = round($totalMinutes / 60, 1);
                
                
                $maxLoad = max(1, $f->max_load_units); // avoid divide by 0
                
                $workload = round(($hours / $maxLoad) * 100);
              
                $subjects = $f->assignments
                    ->pluck('subject.subject_name')
                    ->filter()
                    ->unique()
                    ->values();

             
                $days = $validSchedules
                    ->pluck('timeslot.day_of_week')
                    ->filter()
                    ->unique()
                    ->values();

              
                $maxLoad = $f->max_load_units > 0 ? $f->max_load_units : 21;

                $workload = $maxLoad > 0
                    ? max(0, round(($hours / $maxLoad) * 100))
                    : 0;

                return [
                    ...$f->toArray(),

                    'assigned_load' => $hours,
                    'workload_percent' => $workload,
                    'subjects' => $subjects,
                    'teaching_days' => $days
                ];
            }),

            'departments' => Department::all(),
            'stats' => [
                'total' => Faculty::count(),
                'avg_load' => round(
                    Faculty::with('schedules.timeslot')->get()->avg(function ($f) {

                        $validSchedules = $f->schedules->filter(function ($schedule) {
                            if (!$schedule->timeslot) return false;
                        
                            $start = Carbon::parse($schedule->timeslot->start_time);
                            $end = Carbon::parse($schedule->timeslot->end_time);
                        
                            return $end->gt($start);
                        });
                        
                        $totalMinutes = $validSchedules->sum(function ($schedule) {
                            $start = Carbon::parse($schedule->timeslot->start_time);
                            $end = Carbon::parse($schedule->timeslot->end_time);
                        
                            return $start->diffInMinutes($end); // ✅ FIXED
                        });
                        
                        $hours = round($totalMinutes / 60, 1);
                        
                        $maxLoad = $f->max_load_units > 0 ? $f->max_load_units : 21;
                        
                        $workload = $maxLoad > 0
                            ? min(100, round(($hours / $maxLoad) * 100))
                            : 0;

                        return $maxLoad > 0
                            ? ($hours / $maxLoad) * 100 
                            : 0;
                    }),
                    1
                ),

                'subjects' => \App\Models\Subject::count(),
            ]
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'faculty_code' => 'required|unique:faculties',
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email|unique:faculties',
            'employement_type' => 'required',
            'max_load_units' => 'required',
            'status' => 'required',
            'availabilities' => 'array'
        ]);

        $faculty = Faculty::create($validated);

        if ($request->availabilities) {
            foreach ($request->availabilities as $slot) {
                $faculty->availabilities()->create($slot);
            }
        }

        return redirect()->back()->with('success', 'Faculty created');
    }


    public function update(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'faculty_code' => 'required|unique:faculties,faculty_code,' . $faculty->id,
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email|unique:faculties,email,' . $faculty->id,
            'employement_type' => 'required',
            'max_load_units' => 'required',
            'status' => 'required',
            'availabilities' => 'array'
        ]);

        $faculty->update($validated);
        $faculty->availabilities()->delete();
        if ($request->availabilities) {
            foreach ($request->availabilities as $slot) {
                $faculty->availabilities()->create($slot);
            }
        }

        return redirect()->back()->with('success', 'Faculty updated');
    }

    public function destroy(Faculty $faculty)
    {
        $faculty->delete();
        return redirect()->back()->with('success', 'Faculty Deleted');
    }
}
