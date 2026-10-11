<?php

namespace App\Jobs;

use App\Models\DeliveryStatusEvent;
use App\Services\Push\PushNotifier;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendDeliveryStatusPush implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly DeliveryStatusEvent $event) {}

    public function handle(PushNotifier $notifier): void
    {
        $delivery = $this->event->delivery;
        $tokens = $delivery->order->user->deviceTokens->pluck('expo_push_token')->all();

        $notifier->send($tokens, 'Delivery update', $this->event->status->label());
    }
}
