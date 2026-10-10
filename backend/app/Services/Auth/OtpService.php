<?php

namespace App\Services\Auth;

use App\Models\OtpCode;
use App\Services\Sms\SmsProvider;
use Illuminate\Support\Facades\Hash;

class OtpService
{
    private const CODE_TTL_MINUTES = 5;

    private const MAX_ATTEMPTS = 5;

    public function __construct(private readonly SmsProvider $smsProvider) {}

    public function issue(string $phone): void
    {
        $code = (string) random_int(100000, 999999);

        OtpCode::create([
            'phone' => $phone,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
        ]);

        $this->smsProvider->send($phone, "Your VawaScents verification code is {$code}. It expires in ".self::CODE_TTL_MINUTES.' minutes.');
    }

    public function verify(string $phone, string $code): bool
    {
        $otp = OtpCode::where('phone', $phone)
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();

        if (! $otp || $otp->isExpired() || $otp->attempts >= self::MAX_ATTEMPTS) {
            return false;
        }

        $otp->increment('attempts');

        if (! Hash::check($code, $otp->code_hash)) {
            return false;
        }

        $otp->update(['consumed_at' => now()]);

        return true;
    }
}
