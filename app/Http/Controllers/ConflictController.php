<?php

namespace App\Http\Controllers;

use App\Services\ConflictScannerService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConflictController extends Controller
{
    public function index(ConflictScannerService $scanner)
    {
        // 1. Run the scanner to get live Unresolved conflicts
        $unresolvedConflicts = $scanner->scan();

        // 2. In a fully built app, 'Resolved' conflicts would be fetched from a `resolved_conflicts` table or audit log.
        // For the UI build, we provide the structure you designed.
        $resolvedConflicts = [
            [
                'id' => 'RES-1',
                'type' => 'Teacher Overlap',
                'conflict' => "Preferred Time Conflict\nTeacher availability preference not met",
                'solution' => 'Move to Thursday afternoon',
                'status' => 'Resolved'
            ]
        ];

        return Inertia::render('Conflicts/Index', [
            'unresolved' => $unresolvedConflicts,
            'resolved' => $resolvedConflicts,
            'stats' => [
                'total' => count($unresolvedConflicts) + count($resolvedConflicts),
                'unresolvedCount' => count($unresolvedConflicts),
                'resolvedCount' => count($resolvedConflicts)
            ]
        ]);
    }
}