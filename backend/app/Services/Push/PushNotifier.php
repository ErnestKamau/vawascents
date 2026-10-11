<?php

namespace App\Services\Push;

interface PushNotifier
{
    /**
     * @param  array<int, string>  $tokens
     */
    public function send(array $tokens, string $title, string $body): void;
}
