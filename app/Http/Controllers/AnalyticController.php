<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticController extends Controller
{
    //
    public function index()

    {
        return Inertia::render('Analytics/Index');
    }
}
