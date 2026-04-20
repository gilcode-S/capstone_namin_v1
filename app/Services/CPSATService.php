<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class CPSATService
{
    public function solve(array $candidates)
    {
        try {
            $response = Http::timeout(120)->post(
                'http://127.0.0.1:5001/solve',
                [
                    'candidates' => $candidates
                ]
            );

            if ($response->failed()) {
                throw new \Exception('CP-SAT request failed');
            }

            return $response->json();

        } catch (\Exception $e) {
            // fallback (optional)
            throw new \Exception('CP-SAT Service Error: ' . $e->getMessage());
        }
    }
}