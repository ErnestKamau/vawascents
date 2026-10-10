<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'brand_id' => Brand::factory(),
            'category_id' => Category::factory(),
            'name' => ucfirst($name),
            'slug' => str($name)->slug(),
            'description' => fake()->paragraph(),
            'gender' => fake()->randomElement(['men', 'women', 'unisex']),
            'thumbnail_url' => null,
            'is_active' => true,
        ];
    }
}
