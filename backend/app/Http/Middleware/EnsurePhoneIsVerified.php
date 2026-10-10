<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->hasVerifiedPhone()) {
            return response()->json([
                'message' => 'Phone verification is required before continuing.',
            ], 403);
        }

        return $next($request);
    }
}
