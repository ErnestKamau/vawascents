<?php

namespace App\Providers;

use App\Services\Delivery\DeliveryProvider;
use App\Services\Delivery\LogDeliveryProvider;
use App\Services\Delivery\SaccoDeliveryProvider;
use App\Services\Push\ExpoPushNotifier;
use App\Services\Push\LogPushNotifier;
use App\Services\Push\PushNotifier;
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

        $this->app->bind(DeliveryProvider::class, match (config('services.delivery.driver')) {
            'sacco' => SaccoDeliveryProvider::class,
            default => LogDeliveryProvider::class,
        });

        $this->app->bind(PushNotifier::class, match (config('services.push.driver')) {
            'expo' => ExpoPushNotifier::class,
            default => LogPushNotifier::class,
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
