<?php

namespace App\Providers;

use App\Services\Sms\AdvantaSmsProvider;
use App\Services\Sms\LogSmsProvider;
use App\Services\Sms\SmsProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(SmsProvider::class, match (config('services.sms.driver')) {
            'advanta' => AdvantaSmsProvider::class,
            default => LogSmsProvider::class,
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
