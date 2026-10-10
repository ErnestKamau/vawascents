<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->numberBetween(2000, 50000);
        $shipping = fake()->numberBetween(0, 500);

        return [
            'user_id' => User::factory(),
            'address_id' => Address::factory(),
            'order_number' => strtoupper('ORD-'.fake()->unique()->bothify('########')),
            'status' => 'pending',
            'subtotal_cents' => $subtotal,
            'shipping_cents' => $shipping,
            'total_cents' => $subtotal + $shipping,
            'placed_at' => now(),
        ];
    }
}
