<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        // Simple filtering logic to support your React dropdowns
        $query = AuditLog::query()->latest();

        if ($request->search) {
            $query->where('user_name', 'like', '%' . $request->search . '%');
        }
        if ($request->role && $request->role !== 'All User') {
            $query->where('role', $request->role);
        }
        if ($request->module && $request->module !== 'All Module') {
            $query->where('module', $request->module);
        }
        if ($request->time && $request->time !== 'All Time') {

            if ($request->time === 'Today') {

                $query->whereDate('created_at', today());
            } elseif ($request->time === 'This Week') {

                $query->whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ]);
            } elseif ($request->time === 'This Month') {

                $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
            }
        }

        $logs = $query->paginate(20)->withQueryString();
        $modules = AuditLog::select('module')
            ->distinct()
            ->pluck('module');

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'modules' => $modules,
            'filters' => $request->only([
                'search',
                'role',
                'module',
                'time'
            ])
        ]);
    }
}
