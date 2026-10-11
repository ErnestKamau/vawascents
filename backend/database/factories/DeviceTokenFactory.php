<?php

namespace Database\Factories;

use App\Models\DeviceToken;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DeviceToken>
 */
class DeviceTokenFactory extends Factory
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
            'expo_push_token' => 'ExponentPushToken['.fake()->unique()->bothify('????????????????????').']',
            'platform' => fake()->randomElement(['ios', 'android']),
        ];
    }
}
