<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditLogService
{
    /**
     * General log creator
     */
    public static function log($action, $module, $description)
    {
        if (!auth()->check()) {
            return;
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'role' => auth()->user()->role,
            'action' => $action,
            'module' => $module,
            'description' => $description,
        ]);
    }

    /**
     * CREATE action
     */
    public static function created($module, $description)
    {
        self::log('CREATE', $module, $description);
    }

    /**
     * UPDATE action
     */
    public static function updated($module, $description)
    {
        self::log('UPDATE', $module, $description);
    }

    /**
     * DELETE action
     */
    public static function deleted($module, $description)
    {
        self::log('DELETE', $module, $description);
    }

    /**
     * RESTORE action
     */
    public static function restored($module, $description)
    {
        self::log('RESTORE', $module, $description);
    }

    /**
     * CUSTOM actions
     */
    public static function custom($action, $module, $description)
    {
        self::log($action, $module, $description);
    }
}