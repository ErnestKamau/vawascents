<?php

namespace Database\Factories;

use App\Models\PickupPoint;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PickupPoint>
 */
class PickupPointFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'provider_point_id' => strtoupper('PP-'.fake()->unique()->bothify('########')),
            'name' => fake()->company().' Stage',
            'address' => fake()->streetAddress(),
            'town' => fake()->city(),
            'lat' => fake()->latitude(-1.5, -1.1),
            'lng' => fake()->longitude(36.6, 37.0),
            'operating_hours' => '06:00-21:00',
            'is_active' => true,
            'synced_at' => now(),
        ];
    }
}
