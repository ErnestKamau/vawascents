<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Services\Auth\GoogleTokenVerifier;
use RuntimeException;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    private function mockVerifier(callable $callback): void
    {
        $mock = $this->createMock(GoogleTokenVerifier::class);
        $mock->method('verify')->willReturnCallback($callback);
        $this->app->instance(GoogleTokenVerifier::class, $mock);
    }

    public function test_it_creates_a_new_user_from_a_valid_google_token(): void
    {
        $this->mockVerifier(fn () => (object) [
            'sub' => 'google-123',
            'email' => 'new@example.com',
            'email_verified' => true,
            'name' => 'New User',
        ]);

        $response = $this->postJson('/api/auth/google', ['id_token' => 'valid']);

        $response->assertOk()
            ->assertJsonPath('phone_verification_required', true)
            ->assertJsonPath('user.email', 'new@example.com');

        $this->assertDatabaseHas('users', [
            'google_id' => 'google-123',
            'email' => 'new@example.com',
        ]);
    }

    public function test_it_signs_in_an_existing_user_by_google_id(): void
    {
        $user = User::factory()->create(['google_id' => 'google-123', 'phone_verified_at' => now()]);

        $this->mockVerifier(fn () => (object) [
            'sub' => 'google-123',
            'email' => 'different@example.com',
            'email_verified' => true,
            'name' => 'Existing',
        ]);

        $response = $this->postJson('/api/auth/google', ['id_token' => 'valid']);

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('phone_verification_required', false);
    }

    public function test_it_links_an_existing_email_account_by_email(): void
    {
        $user = User::factory()->create(['email' => 'linked@example.com', 'google_id' => null]);

        $this->mockVerifier(fn () => (object) [
            'sub' => 'google-456',
            'email' => 'linked@example.com',
            'email_verified' => true,
            'name' => 'Linked',
        ]);

        $this->postJson('/api/auth/google', ['id_token' => 'valid'])->assertOk();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'google_id' => 'google-456',
        ]);
    }

    public function test_it_rejects_an_invalid_google_token(): void
    {
        $this->mockVerifier(function () {
            throw new RuntimeException('Unexpected token audience.');
        });

        $this->postJson('/api/auth/google', ['id_token' => 'bad'])
            ->assertStatus(401)
            ->assertJsonPath('message', 'Unexpected token audience.');
    }
}
