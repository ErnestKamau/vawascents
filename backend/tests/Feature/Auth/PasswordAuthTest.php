<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;

class PasswordAuthTest extends TestCase
{
    private function validRegisterPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'phone' => '+254712345678',
            'date_of_birth' => '1990-01-01',
            'gender' => 'female',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'terms_accepted' => true,
        ], $overrides);
    }

    public function test_a_user_can_register_with_email_and_password(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validRegisterPayload());

        $response->assertCreated()->assertJsonStructure(['token', 'user', 'phone_verification_required']);
        $this->assertDatabaseHas('users', ['email' => 'ada@example.com', 'gender' => 'female']);
    }

    public function test_registering_with_a_taken_email_fails(): void
    {
        User::factory()->create(['email' => 'ada@example.com']);

        $this->postJson('/api/auth/register', $this->validRegisterPayload(['phone' => '+254711111111']))
            ->assertStatus(422);
    }

    public function test_registering_without_accepting_terms_fails(): void
    {
        $this->postJson('/api/auth/register', $this->validRegisterPayload(['terms_accepted' => false]))
            ->assertStatus(422);
    }

    public function test_a_user_can_log_in_with_email_and_password(): void
    {
        $user = User::factory()->create(['email' => 'ada@example.com', 'password' => 'password123']);

        $this->postJson('/api/auth/login', [
            'identifier' => 'ada@example.com',
            'password' => 'password123',
        ])->assertOk()->assertJsonStructure(['token', 'user', 'phone_verification_required']);
    }

    public function test_a_user_can_log_in_with_verified_phone_and_password(): void
    {
        User::factory()->create([
            'phone' => '+254712345678',
            'phone_verified_at' => now(),
            'password' => 'password123',
        ]);

        $this->postJson('/api/auth/login', [
            'identifier' => '+254712345678',
            'password' => 'password123',
        ])->assertOk();
    }

    public function test_an_incorrect_password_is_rejected(): void
    {
        User::factory()->create(['email' => 'ada@example.com', 'password' => 'password123']);

        $this->postJson('/api/auth/login', [
            'identifier' => 'ada@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422);
    }

    public function test_a_google_only_account_without_a_password_cannot_log_in_with_a_password(): void
    {
        User::factory()->create(['email' => 'ada@example.com', 'password' => null, 'google_id' => 'google-123']);

        $this->postJson('/api/auth/login', [
            'identifier' => 'ada@example.com',
            'password' => 'anything',
        ])->assertStatus(422);
    }
}
