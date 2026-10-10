<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\Auth\PasswordAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/google', GoogleAuthController::class);
Route::post('/auth/register', [PasswordAuthController::class, 'register']);
Route::post('/auth/login', [PasswordAuthController::class, 'login']);

Route::middleware('auth:sanctum')->prefix('auth')->group(function (): void {
    Route::post('/otp/send', [OtpController::class, 'send']);
    Route::post('/otp/verify', [OtpController::class, 'verify']);
    Route::get('/user', fn (Request $request) => $request->user());
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    });
});

// Everything below requires a signed-in, phone-verified customer.
Route::middleware(['auth:sanctum', 'phone.verified'])->group(function (): void {
    //
});
