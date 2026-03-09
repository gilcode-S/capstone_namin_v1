<?php

namespace App\Http\Controllers;

use App\Models\ScheduleVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    //

    public function index()
    {
        $scheduleVersion = ScheduleVersion::latest()->first();

        return inertia('Dashboard', [
            'scheduleVersion' => $scheduleVersion
        ]);
    }
}
