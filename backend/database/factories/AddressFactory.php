<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'label' => fake()->randomElement(['Home', 'Work', null]),
            'recipient_name' => fake()->name(),
            'phone' => fake()->numerify('07########'),
            'line1' => fake()->streetAddress(),
            'line2' => null,
            'city' => fake()->city(),
            'country' => 'Kenya',
            'is_default' => false,
        ];
    }
}
