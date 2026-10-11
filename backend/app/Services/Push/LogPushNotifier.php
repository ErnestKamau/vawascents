<?php

namespace App\Services\Push;

use Illuminate\Support\Facades\Log;

/**
 * Stub notifier used until Expo push is wired up. Logs instead of sending.
 */
class LogPushNotifier implements PushNotifier
{
    public function send(array $tokens, string $title, string $body): void
    {
        Log::info('Push (stub)', ['tokens' => $tokens, 'title' => $title, 'body' => $body]);
    }
}
