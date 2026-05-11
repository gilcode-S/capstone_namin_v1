<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Subject;
use App\Models\Room;
use App\Models\Section;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->role;

        $stats = [];
        $quickActions = [];

        // 1. Gather Role-Specific Stats & Quick Actions
        if ($role === 'hr') {
            $stats = [
                ['label' => 'Total Teachers', 'value' => Teacher::count(), 'desc' => 'Active faculty members', 'icon' => 'user-group'],
                ['label' => 'Missing Domains', 'value' => Teacher::doesntHave('domain')->count(), 'desc' => 'Requires domain tagging', 'icon' => 'exclamation-circle', 'alert' => true],
                ['label' => 'Avg Workload', 'value' => '18 hrs', 'desc' => 'Across all faculty', 'icon' => 'clock'],
            ];
            $quickActions = [
                ['title' => 'Manage Teachers', 'desc' => 'Update faculty availability', 'url' => '/teachers']
            ];
        } elseif ($role === 'registrar') {
            $stats = [
                ['label' => 'Total Subjects', 'value' => Subject::count(), 'desc' => 'Courses in registry', 'icon' => 'book-open'],
                ['label' => 'Total Sections', 'value' => Section::count(), 'desc' => 'Active student cohorts', 'icon' => 'users'],
                ['label' => 'Missing Prereqs', 'value' => Subject::where('type', 'Major')->whereNull('prerequisite_subject_id')->count(), 'desc' => 'Majors without prereqs', 'icon' => 'exclamation-circle'],
            ];
            $quickActions = [
                ['title' => 'Manage Subjects', 'desc' => 'Update academic registry', 'url' => '/subjects'],
                ['title' => 'Map Curriculum', 'desc' => 'Assign subjects to semesters', 'url' => '/curriculum']
            ];
        } elseif ($role === 'staff') {
            $stats = [
                ['label' => 'Total Classrooms', 'value' => Room::count(), 'desc' => 'Available physical spaces', 'icon' => 'building-office'],
                ['label' => 'Unresolved Conflicts', 'value' => 3 /* Simulated from ConflictScanner */, 'desc' => 'Requires immediate action', 'icon' => 'exclamation-triangle', 'alert' => true],
                ['label' => 'Active Schedule', 'value' => 'V.2', 'desc' => '2026-2027 1st Sem', 'icon' => 'calendar'],
            ];
            $quickActions = [
                ['title' => 'Generate New Schedule', 'desc' => 'Run optimization algorithm', 'url' => '/schedules/generator'],
                ['title' => 'Resolve Conflicts', 'desc' => 'Review scheduling overlaps', 'url' => '/conflicts']
            ];
        } else { // Super Admin / Director
            $stats = [
                ['label' => 'Total Teachers', 'value' => Teacher::count(), 'desc' => 'Active faculty members', 'icon' => 'user-group'],
                ['label' => 'Classrooms', 'value' => Room::count(), 'desc' => 'Available rooms & labs', 'icon' => 'building-office'],
                ['label' => 'Subjects', 'value' => Subject::count(), 'desc' => 'Courses to schedule', 'icon' => 'book-open'],
                ['label' => 'Sections', 'value' => Section::count(), 'desc' => 'Sections from all departments', 'icon' => 'clock'],
            ];
            $quickActions = [
                ['title' => 'Analytics Dashboard', 'desc' => 'View system performance', 'url' => '/analytics'],
                ['title' => 'System Access', 'desc' => 'Manage staff accounts', 'url' => '/users']
            ];
        }

        // 2. Fetch Global Recent Activities (Using Laravel's diffForHumans for nice formatting)
        $activities = AuditLog::latest()->take(5)->get()->map(function ($log) {
            return [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'user' => $log->user_name,
                'module' => $log->module,
                'time' => $log->created_at->diffForHumans() // e.g., "2 hours ago"
            ];
        });

        // 3. Optimization Metrics (Simulated for the Director/Scheduler view)
        $metrics = [
            ['label' => 'Teacher Workload Balance', 'score' => 94, 'status' => 'Excellent'],
            ['label' => 'Classroom Utilization', 'score' => 85, 'status' => 'Good'],
            ['label' => 'Conflict Resolution', 'score' => 78, 'status' => 'Satisfactory'],
            ['label' => 'Resource Efficiency', 'score' => 89, 'status' => 'Good'],
        ];

        return Inertia::render('dashboard', [
            'roleStats' => $stats,
            'quickActions' => $quickActions,
            'activities' => $activities,
            'metrics' => $metrics,
            'userRole' => $role
        ]);
    }


    public function backupDatabase()
    {
        // Define the file name
        $filename = "school_backup_" . date('Y-m-d_H-i-s') . ".sql";
        $storagePath = storage_path("app/public/" . $filename);

        // XAMPP MySQL Dump command (Adjust the path if you use Laragon/WAMP)
        // Format: mysqldump -u [username] [database_name] > [output_file]
        $command = "C:\\xampp\\mysql\\bin\\mysqldump.exe -u root your_database_name > " . $storagePath;

        // Execute the command on the computer
        exec($command);

        // Force the browser to download the file
        return response()->download($storagePath)->deleteFileAfterSend(true);
    }
}
