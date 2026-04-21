<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class CPSATService
{
    public function solve(array $candidates)
    {
        $response = Http::timeout(120)->post(
            'http://127.0.0.1:5001/solve',
            ['candidates' => $candidates]
        );

        return $response->json() ?? [];
    }
}
