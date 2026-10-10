<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $volume = fake()->randomElement([30, 50, 75, 100, 125]);

        return [
            'product_id' => Product::factory(),
            'sku' => strtoupper(fake()->unique()->bothify('VWS-####-??')),
            'volume_ml' => $volume,
            'price_cents' => $volume * fake()->numberBetween(80, 250),
            'stock_quantity' => fake()->numberBetween(0, 100),
            'is_active' => true,
        ];
    }
}
