<?php

namespace App\Services\Scheduler;

class RuleEngineService
{
    public function filter($classUnits)
    {
        return array_values(array_filter($classUnits, function ($cu) {

            // ❌ must have subject
            if (empty($cu['subject_id'])) return false;

            // ❌ must have section
            if (empty($cu['section_id'])) return false;

            // ❌ must have valid units/hours
            if (!isset($cu['hours_per_week']) || $cu['hours_per_week'] <= 0) return false;

            // ❌ must have domain (important for faculty matching later)
            if (empty($cu['domain'])) return false;

            // ❌ avoid broken room type
            if (empty($cu['room_type'])) {
                $cu['room_type'] = 'Lecture'; // fallback instead of reject
            }

            return true;
        }));
    }
}