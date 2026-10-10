<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $unitPrice = fake()->numberBetween(2000, 15000);
        $quantity = fake()->numberBetween(1, 3);

        return [
            'order_id' => Order::factory(),
            'product_variant_id' => ProductVariant::factory(),
            'product_name' => fake()->words(3, true),
            'sku' => strtoupper(fake()->unique()->bothify('VWS-####-??')),
            'unit_price_cents' => $unitPrice,
            'quantity' => $quantity,
            'subtotal_cents' => $unitPrice * $quantity,
        ];
    }
}
