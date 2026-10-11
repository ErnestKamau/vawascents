<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Sends SMS via Advanta SMS (QuickSMS) — https://quicksms.advantasms.com
 */
class AdvantaSmsProvider implements SmsProvider
{
    public function send(string $phone, string $message): void
    {
        $config = config('services.advanta');

        $response = Http::baseUrl($config['base_url'])
            ->post('/api/services/sendsms/', [
                'apikey' => $config['api_key'],
                'partnerID' => $config['partner_id'],
                'shortcode' => $config['shortcode'],
                'mobile' => ltrim($phone, '+'),
                'message' => $message,
            ]);

        if ($response->failed()) {
            throw new RuntimeException("Advanta SMS request failed: {$response->status()} {$response->body()}");
        }
    }
}
