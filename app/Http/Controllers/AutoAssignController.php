<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Services\AutoAssignService;
use Illuminate\Http\Request;

class AutoAssignController extends Controller
{
    public function assign($subjectId, AutoAssignService $service)
    {
        $subject = Subject::findOrFail($subjectId);

        $faculty = $service->assignBestFaculty($subject);

        if (!$faculty) {
            return response()->json([
                'message' => 'No suitable faculty found'
            ], 404);
        }

        return response()->json([
            'faculty_id' => $faculty->id,
            'faculty_name' => $faculty->full_name
        ]);
    }
}
