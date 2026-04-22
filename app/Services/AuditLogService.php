<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditLogService
{
    /**
     * Create a new audit log entry
     */
    public static function log(array $data): void
    {
        $user = Auth::user();

        AuditLog::create([
            'user_id'     => $user?->id,
            'user_name'   => $user?->name ?? 'System',
            'role'        => $user?->role ?? null,

            'action'      => $data['action'] ?? 'UNKNOWN',
            'module'      => $data['module'] ?? 'GENERAL',

            'description' => $data['description'] ?? null,

            'old_data'    => isset($data['old_data']) ? json_encode($data['old_data']) : null,
            'new_data'    => isset($data['new_data']) ? json_encode($data['new_data']) : null,

            'is_restorable' => $data['is_restorable'] ?? true,

            'created_at'  => now(),
        ]);
    }

    /**
     * Helper for CREATE logs
     */
    public static function created(string $module, $newData, string $description = null): void
    {
        self::log([
            'action' => 'CREATE',
            'module' => $module,
            'description' => $description,
            'old_data' => null,
            'new_data' => $newData,
            'is_restorable' => false, // usually cannot restore create
        ]);
    }

    /**
     * Helper for UPDATE logs
     */
    public static function updated(string $module, $oldData, $newData, string $description = null): void
    {
        self::log([
            'action' => 'UPDATE',
            'module' => $module,
            'description' => $description,
            'old_data' => $oldData,
            'new_data' => $newData,
        ]);
    }

    /**
     * Helper for DELETE logs
     */
    public static function deleted(string $module, $oldData, string $description = null): void
    {
        self::log([
            'action' => 'DELETE',
            'module' => $module,
            'description' => $description,
            'old_data' => $oldData,
            'new_data' => null,
        ]);
    }

    /**
     * Helper for RESTORE logs
     */
    public static function restored(string $module, $oldData, $newData, string $description = null): void
    {
        self::log([
            'action' => 'RESTORE',
            'module' => $module,
            'description' => $description,
            'old_data' => $oldData,
            'new_data' => $newData,
        ]);
    }
}