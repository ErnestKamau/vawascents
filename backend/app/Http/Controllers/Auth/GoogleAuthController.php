<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\GoogleSignInRequest;
use App\Models\User;
use App\Services\Auth\GoogleTokenVerifier;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class GoogleAuthController extends Controller
{
    public function __construct(private readonly GoogleTokenVerifier $verifier) {}

    public function __invoke(GoogleSignInRequest $request): JsonResponse
    {
        try {
            $payload = $this->verifier->verify($request->string('id_token')->toString());
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 401);
        }

        $user = User::firstWhere('google_id', $payload->sub)
            ?? User::firstWhere('email', $payload->email);

        if ($user) {
            $user->fill([
                'google_id' => $payload->sub,
                'name' => $user->name ?: ($payload->name ?? $payload->email),
            ])->save();
        } else {
            $user = User::create([
                'google_id' => $payload->sub,
                'email' => $payload->email,
                'name' => $payload->name ?? $payload->email,
                'password' => null,
                'email_verified_at' => now(),
            ]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'phone_verification_required' => ! $user->hasVerifiedPhone(),
        ]);
    }
}
