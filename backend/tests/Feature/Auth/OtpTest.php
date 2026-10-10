<?php

namespace Tests\Feature\Auth;

use App\Models\OtpCode;
use App\Models\User;
use App\Services\Sms\SmsProvider;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OtpTest extends TestCase
{
    public function test_authenticated_user_can_request_an_otp(): void
    {
        $user = User::factory()->create();
        $sms = $this->createMock(SmsProvider::class);
        $sms->expects($this->once())->method('send')->with('+254712345678', $this->isType('string'));
        $this->app->instance(SmsProvider::class, $sms);

        $this->actingAs($user)
            ->postJson('/api/auth/otp/send', ['phone' => '+254712345678'])
            ->assertOk();

        $this->assertDatabaseHas('otp_codes', ['phone' => '+254712345678']);
    }

    public function test_user_can_verify_a_correct_otp_and_gets_phone_verified(): void
    {
        $user = User::factory()->create();

        OtpCode::create([
            'phone' => '+254712345678',
            'code_hash' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(5),
        ]);

        $this->actingAs($user)
            ->postJson('/api/auth/otp/verify', ['phone' => '+254712345678', 'code' => '123456'])
            ->assertOk();

        $this->assertTrue($user->refresh()->hasVerifiedPhone());
        $this->assertSame('+254712345678', $user->phone);
    }

    public function test_an_incorrect_otp_is_rejected(): void
    {
        $user = User::factory()->create();

        OtpCode::create([
            'phone' => '+254712345678',
            'code_hash' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(5),
        ]);

        $this->actingAs($user)
            ->postJson('/api/auth/otp/verify', ['phone' => '+254712345678', 'code' => '000000'])
            ->assertStatus(422);

        $this->assertFalse($user->refresh()->hasVerifiedPhone());
    }

    public function test_an_expired_otp_is_rejected(): void
    {
        $user = User::factory()->create();

        OtpCode::create([
            'phone' => '+254712345678',
            'code_hash' => Hash::make('123456'),
            'expires_at' => now()->subMinute(),
        ]);

        $this->actingAs($user)
            ->postJson('/api/auth/otp/verify', ['phone' => '+254712345678', 'code' => '123456'])
            ->assertStatus(422);
    }

    public function test_a_phone_already_linked_to_another_account_cannot_be_reused(): void
    {
        User::factory()->create(['phone' => '+254712345678', 'phone_verified_at' => now()]);
        $user = User::factory()->create();

        OtpCode::create([
            'phone' => '+254712345678',
            'code_hash' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(5),
        ]);

        $this->actingAs($user)
            ->postJson('/api/auth/otp/verify', ['phone' => '+254712345678', 'code' => '123456'])
            ->assertStatus(422);
    }
}
