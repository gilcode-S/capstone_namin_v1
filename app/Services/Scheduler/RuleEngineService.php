<?php

namespace App\Services\Scheduler;

class RuleEngineService
{
    public function filter($classUnits)
    {
        return array_values(array_filter($classUnits, function ($cu) {

            if (empty($cu['subject_id'])) return false;
            if (empty($cu['section_id'])) return false;

            // ✅ FIXED: use correct field
            if (!isset($cu['total_hours']) || $cu['total_hours'] <= 0) return false;

            // domains is ARRAY now (correct)
            if (empty($cu['domains'])) return false;

            // fallback instead of reject
            if (empty($cu['room_type'])) {
                $cu['room_type'] = 'Lecture';
            }

            return true;
        }));
    }
}
