<?php

use App\Http\Controllers\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DeliveryController as AdminDeliveryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\PickupPointController as AdminPickupPointController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\Auth\PasswordAuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Delivery\DeliveryController;
use App\Http\Controllers\Delivery\DeliveryWebhookController;
use App\Http\Controllers\Delivery\PickupPointController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/google', GoogleAuthController::class);
Route::post('/auth/register', [PasswordAuthController::class, 'register']);
Route::post('/auth/login', [PasswordAuthController::class, 'login']);
Route::post('/auth/password/forgot', [PasswordResetController::class, 'sendCode']);
Route::post('/auth/password/reset', [PasswordResetController::class, 'reset']);

// Inbound from the sacco delivery API — HMAC-signed, no user session.
Route::post('/webhooks/delivery', DeliveryWebhookController::class)
    ->middleware('delivery.webhook.signature');

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
    Route::get('/delivery/pickup-points', PickupPointController::class);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/payment', [PaymentController::class, 'store']);
    Route::post('/orders/{order}/delivery', [DeliveryController::class, 'store']);
    Route::get('/orders/{order}/delivery', [DeliveryController::class, 'show']);
});

// Staff back office — requires an authenticated admin account.
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function (): void {
    Route::get('/dashboard', AdminDashboardController::class);

    Route::apiResource('categories', AdminCategoryController::class)->except('show');
    Route::apiResource('brands', AdminBrandController::class)->except('show');
    Route::apiResource('products', AdminProductController::class);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

    Route::get('/payments', [AdminPaymentController::class, 'index']);
    Route::get('/payments/{payment}', [AdminPaymentController::class, 'show']);
    Route::post('/payments/{payment}/refund', [AdminPaymentController::class, 'refund']);

    Route::get('/pickup-points', [AdminPickupPointController::class, 'index']);
    Route::patch('/pickup-points/{pickupPoint}', [AdminPickupPointController::class, 'update']);

    Route::get('/deliveries', [AdminDeliveryController::class, 'index']);
    Route::get('/deliveries/{delivery}', [AdminDeliveryController::class, 'show']);
});
