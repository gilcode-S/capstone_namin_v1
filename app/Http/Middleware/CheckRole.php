<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next,  ...$allowedRoles): Response
    {
        $user = $request->user();

        // Super Admin bypasses all restrictions
        if ($user && $user->role === 'Super Admin') {
            return $next($request);
        }

        // Check if the user's role is in the allowed list for this route
        if (!$user || !in_array($user->role, $allowedRoles)) {
            abort(403, 'Unauthorized action. You do not have permission to modify this module.');
        }

        return $next($request);
    }
}
