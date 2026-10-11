<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyDeliveryWebhookSignature
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('services.sacco.webhook_secret');
        $signature = $request->header('X-Signature', '');
        $expected = hash_hmac('sha256', $request->getContent(), (string) $secret);

        if ($secret === null || ! hash_equals($expected, $signature)) {
            return response()->json(['message' => 'Invalid webhook signature.'], 401);
        }

        return $next($request);
    }
}
