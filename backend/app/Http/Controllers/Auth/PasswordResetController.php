<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Models\User;
use App\Services\Auth\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\RateLimiter;

class PasswordResetController extends Controller
{
    public function __construct(private readonly OtpService $otpService) {}

    public function sendCode(SendOtpRequest $request): JsonResponse
    {
        $phone = $request->string('phone')->toString();

        if (! User::where('phone', $phone)->exists()) {
            return response()->json(['message' => 'No account found for that phone number.'], 422);
        }

        $throttleKey = "password-reset-send:{$phone}";

        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            return response()->json(['message' => 'Too many codes requested. Try again in a minute.'], 429);
        }

        RateLimiter::hit($throttleKey, 60);

        $this->otpService->issue($phone);

        return response()->json(['message' => 'Verification code sent.']);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $phone = $request->string('phone')->toString();
        $code = $request->string('code')->toString();

        if (! $this->otpService->verify($phone, $code)) {
            return response()->json(['message' => 'Invalid or expired code.'], 422);
        }

        $user = User::where('phone', $phone)->first();

        if (! $user) {
            return response()->json(['message' => 'No account found for that phone number.'], 422);
        }

        $user->forceFill(['password' => $request->string('password')->toString()])->save();

        return response()->json(['message' => 'Password updated. You can now log in.']);
    }
}
