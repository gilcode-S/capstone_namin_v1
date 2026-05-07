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

        $logs = $query->paginate(20)->withQueryString();

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'role', 'module'])
        ]);
    }
}