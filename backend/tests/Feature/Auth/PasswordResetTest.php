<?php

namespace Tests\Feature\Auth;

use App\Models\OtpCode;
use App\Models\User;
use App\Services\Sms\SmsProvider;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    public function test_a_code_is_sent_for_an_existing_phone(): void
    {
        User::factory()->create(['phone' => '+254712345678']);
        $sms = $this->createMock(SmsProvider::class);
        $sms->expects($this->once())->method('send');
        $this->app->instance(SmsProvider::class, $sms);

        $this->postJson('/api/auth/password/forgot', ['phone' => '+254712345678'])->assertOk();
    }

    public function test_sending_a_code_for_an_unknown_phone_fails(): void
    {
        $this->postJson('/api/auth/password/forgot', ['phone' => '+254712345678'])->assertStatus(422);
    }

    public function test_a_valid_code_resets_the_password(): void
    {
        $user = User::factory()->create(['phone' => '+254712345678', 'password' => 'old-password']);

        OtpCode::create([
            'phone' => '+254712345678',
            'code_hash' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(5),
        ]);

        $this->postJson('/api/auth/password/reset', [
            'phone' => '+254712345678',
            'code' => '123456',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk();

        $this->postJson('/api/auth/login', [
            'identifier' => '+254712345678',
            'password' => 'new-password',
        ])->assertOk();
    }

    public function test_an_invalid_code_does_not_reset_the_password(): void
    {
        User::factory()->create(['phone' => '+254712345678', 'password' => 'old-password']);

        OtpCode::create([
            'phone' => '+254712345678',
            'code_hash' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(5),
        ]);

        $this->postJson('/api/auth/password/reset', [
            'phone' => '+254712345678',
            'code' => '000000',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertStatus(422);
    }
}
