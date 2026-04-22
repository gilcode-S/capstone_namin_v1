<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    //

    public function index(Request $request)
    {
        $logs = AuditLog::query()
            ->when(
                $request->user,
                fn($q) =>
                $q->where('user_name', 'like', "%{$request->user}%")
            )
            ->when(
                $request->role,
                fn($q) =>
                $q->where('role', $request->role)
            )
            ->when(
                $request->module,
                fn($q) =>
                $q->where('module', $request->module)
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['user', 'role', 'module']),
            'roles' => User::select('role')
                ->distinct()
                ->pluck('role')
                ->toArray()
        ]);
    }

    public function restore($id)
    {
        $log = AuditLog::findOrFail($id);

        if (!$log->is_restorable) {
            return back()->with('error', 'Not allowed');
        }

        $latest = AuditLog::where('module', $log->module)
            ->latest()
            ->first();

        if ($latest->id === $log->id) {
            return back()->with('error', 'Cannot restore latest');
        }

        // ⚠️ You must define how restore works per module
        // Example:
        // Schedule::update($log->old_data);

        AuditLogService::restored(
            $log->module,
            $log->new_data,
            $log->old_data,
            'Restored previous state'
        );

        return back();
    }
}
