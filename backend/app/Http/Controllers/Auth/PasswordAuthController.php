<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class PasswordAuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'phone' => $request->filled('phone') ? $request->string('phone')->toString() : null,
            'password' => $request->string('password')->toString(),
        ]);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'phone_verification_required' => ! $user->hasVerifiedPhone(),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $identifier = $request->string('identifier')->toString();
        $throttleKey = 'login:'.Str::lower($identifier);

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            return response()->json([
                'message' => 'Too many login attempts. Try again in a minute.',
            ], 429);
        }

        $field = str_contains($identifier, '@') ? 'email' : 'phone';
        $user = User::where($field, $identifier)->first();

        if (! $user || ! $user->password || ! Hash::check($request->string('password')->toString(), $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            return response()->json(['message' => 'Those credentials don\'t match an account.'], 422);
        }

        RateLimiter::clear($throttleKey);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'phone_verification_required' => ! $user->hasVerifiedPhone(),
        ]);
    }
}
