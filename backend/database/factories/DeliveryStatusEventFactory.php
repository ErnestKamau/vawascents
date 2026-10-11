<?php

namespace Database\Factories;

use App\Enums\DeliveryStatus;
use App\Models\Delivery;
use App\Models\DeliveryStatusEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DeliveryStatusEvent>
 */
class DeliveryStatusEventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'delivery_id' => Delivery::factory(),
            'status' => DeliveryStatus::Booked,
            'occurred_at' => now(),
            'notes' => null,
            'raw_payload' => null,
        ];
    }
}
