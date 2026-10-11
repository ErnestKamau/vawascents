<?php

namespace App\Services\Push;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Sends push notifications via Expo's push API — https://docs.expo.dev/push-notifications/sending-notifications/
 */
class ExpoPushNotifier implements PushNotifier
{
    public function send(array $tokens, string $title, string $body): void
    {
        if ($tokens === []) {
            return;
        }

        $messages = array_map(
            fn (string $token) => ['to' => $token, 'title' => $title, 'body' => $body],
            $tokens,
        );

        $response = Http::post('https://exp.host/--/api/v2/push/send', $messages);

        if ($response->failed()) {
            throw new RuntimeException("Expo push request failed: {$response->status()} {$response->body()}");
        }
    }
}
