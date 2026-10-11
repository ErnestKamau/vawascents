<?php

namespace App\Services\Delivery;

use App\Enums\DeliveryStatus;
use Illuminate\Support\Carbon;

readonly class DeliveryBookingResult
{
    public function __construct(
        public string $providerReference,
        public DeliveryStatus $status,
        public ?Carbon $estimatedArrival = null,
    ) {}
}
