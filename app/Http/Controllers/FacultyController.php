<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Department;
use App\Models\DomainGroup;
use App\Models\Domain;
use App\Models\Schedule;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacultyController extends Controller
{


    private function calculateTeacherHours($teacherId)
    {
        return Schedule::where('teacher_id', $teacherId)
            ->with('timeslot')
            ->get()
            ->sum(function ($s) {
                if (!$s->timeslot) return 0;

                return (
                    strtotime($s->timeslot->end_time) -
                    strtotime($s->timeslot->start_time)
                ) / 3600;
            });
    }
    public function index(Request $request)
    {
        $query = Teacher::with(['department', 'domainGroup', 'specialization']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        if ($request->department) {
            $query->where('department_id', $request->department);
        }

        $teachers = $query->paginate(10)->withQueryString();

        // 🔥 FIX: compute inside collection
        $teachers->getCollection()->transform(function ($t) {

            $currentHours = $this->calculateTeacherHours($t->id);

            $t->assigned_load = $currentHours; // ✅ THIS is what UI uses

            $t->workload_percent = $t->max_hours
                ? round(($currentHours / $t->max_hours) * 100)
                : 0;

            return $t;
        });

        $avgLoad = $teachers->getCollection()->avg(function ($t) {
            return $t->workload_percent ?? 0;
        });

        return Inertia::render('Facultys/Index', [
            'faculties' => $teachers->through(function ($t) {
                return [
                    ...$t->toArray(),

                    // 🔥 now consistent
                    'assigned_load' => $t->assigned_load,
                    'workload_percent' => $t->workload_percent,

                    'availability_full' => $t->availability_days ?? [],
                    'schedule_full' => [],
                    'subjects' => [],
                ];
            }),

            'departments' => Department::all(),
            'domainGroups' => DomainGroup::with('domains')->get(),
            'domains' => Domain::all(),

            'filters' => [
                'search' => $request->search,
                'department' => $request->department
            ],

            'stats' => [
                'total' => Teacher::count(),
                'avg_load' => round($avgLoad, 1),
            ],
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:teachers,code',
            'name' => 'required|string',

            'department_id' => 'required|exists:departments,id',
            'degree' => 'required|in:Undergraduate,Masters,PhD',

            'domain_group_id' => 'required|exists:domain_groups,id',
            'specialization_id' => 'nullable|exists:domains,id',
            'custom_specialization' => 'nullable|string',

            'experience_years' => 'required|integer|min:0',

            'current_hours' => 'required|integer|min:0',
            'max_hours' => 'required|integer|min:0|gte:current_hours',

            'availability_days' => 'required|array',
            'shift_preferences' => 'required|array',
        ]);

        $teacher = Teacher::create($validated);

        AuditLogService::created(
            'Teacher',
            "Created teacher: {$teacher->name} ({$teacher->id})"
        );

        return redirect()->back()->with('success', 'Teacher created');
    }

    public function update(Request $request, Teacher $faculty)
    {
        $validated = $request->validate([
            'code' => 'required|unique:teachers,code,' . $faculty->id,
            'name' => 'required|string',

            'department_id' => 'required|exists:departments,id',
            'degree' => 'required|in:Undergraduate,Masters,PhD',

            'domain_group_id' => 'required|exists:domain_groups,id',
            'specialization_id' => 'nullable|exists:domains,id',
            'custom_specialization' => 'nullable|string',

            'experience_years' => 'required|integer|min:0',
            'current_hours' => 'required|integer|min:0',
            'max_hours' => 'required|integer|min:0|gte:current_hours',

            'availability_days' => 'required|array',
            'shift_preferences' => 'required|array',
        ]);

        $faculty->update($validated);

        AuditLogService::updated(
            'Teacher',
            "Updated teacher: {$faculty->name} ({$faculty->id})"
        );

        return redirect()->back()->with('success', 'Teacher updated');
    }

    public function destroy(Teacher $faculty)
    {
        $faculty->delete();

        AuditLogService::deleted(
            'Teacher',
            "Deleted teacher: {$faculty->name} ({$faculty->id})"
        );

        return redirect()->back()->with('success', 'Teacher deleted');
    }
}
