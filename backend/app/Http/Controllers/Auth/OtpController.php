<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Models\User;
use App\Services\Auth\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\RateLimiter;

class OtpController extends Controller
{
    public function __construct(private readonly OtpService $otpService) {}

    public function send(SendOtpRequest $request): JsonResponse
    {
        $phone = $request->string('phone')->toString();

        $throttleKey = "otp-send:{$phone}";

        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            return response()->json([
                'message' => 'Too many codes requested. Try again in a minute.',
            ], 429);
        }

        RateLimiter::hit($throttleKey, 60);

        $this->otpService->issue($phone);

        return response()->json(['message' => 'Verification code sent.']);
    }

    public function verify(VerifyOtpRequest $request): JsonResponse
    {
        $phone = $request->string('phone')->toString();
        $code = $request->string('code')->toString();

        if (! $this->otpService->verify($phone, $code)) {
            return response()->json(['message' => 'Invalid or expired code.'], 422);
        }

        $user = $request->user();

        if (User::where('phone', $phone)->whereKeyNot($user->id)->exists()) {
            return response()->json(['message' => 'This phone number is already linked to another account.'], 422);
        }

        $user->forceFill([
            'phone' => $phone,
            'phone_verified_at' => now(),
        ])->save();

        return response()->json(['user' => $user->fresh()]);
    }
}
