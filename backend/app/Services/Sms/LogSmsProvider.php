<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Log;

/**
 * Stub provider used until a real SMS gateway is wired up.
 * Logs the message instead of sending it.
 */
class LogSmsProvider implements SmsProvider
{
    public function send(string $phone, string $message): void
    {
        Log::info('SMS (stub)', ['phone' => $phone, 'message' => $message]);
    }
}
