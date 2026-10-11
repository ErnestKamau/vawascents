<?php

namespace Database\Factories;

use App\Enums\DeliveryStatus;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\PickupPoint;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Delivery>
 */
class DeliveryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'pickup_point_id' => PickupPoint::factory(),
            'provider_reference' => strtoupper('DLV-'.fake()->unique()->bothify('########')),
            'status' => DeliveryStatus::Booked,
            'estimated_arrival' => now()->addDays(2),
        ];
    }
}
