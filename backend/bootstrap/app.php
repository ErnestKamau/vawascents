<?php

use App\Http\Middleware\EnsurePhoneIsVerified;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\VerifyDeliveryWebhookSignature;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->alias([
            'phone.verified' => EnsurePhoneIsVerified::class,
            'admin' => EnsureUserIsAdmin::class,
            'delivery.webhook.signature' => VerifyDeliveryWebhookSignature::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
