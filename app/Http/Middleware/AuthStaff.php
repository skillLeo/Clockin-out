<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->user()->role !== 'staff') {
            abort(403);
        }

        return $next($request);
    }
}
