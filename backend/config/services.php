<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        // Comma-separated: include the iOS, Android, and Web OAuth client IDs
        // from Google Cloud Console, since the ID token's `aud` varies by platform.
        'client_ids' => array_filter(explode(',', env('GOOGLE_CLIENT_IDS', ''))),
    ],

    'sms' => [
        'driver' => env('SMS_DRIVER', 'log'),
    ],

    'advanta' => [
        'api_key' => env('ADVANTA_API_KEY'),
        'partner_id' => env('ADVANTA_PARTNER_ID'),
        'shortcode' => env('ADVANTA_SHORTCODE'),
        'base_url' => env('ADVANTA_BASE_URL', 'https://quicksms.advantasms.com'),
    ],

    'delivery' => [
        'driver' => env('DELIVERY_DRIVER', 'log'),
    ],

    'push' => [
        'driver' => env('PUSH_DRIVER', 'log'),
    ],

    'sacco' => [
        'base_url' => env('SACCO_DELIVERY_BASE_URL'),
        'api_key' => env('SACCO_DELIVERY_API_KEY'),
        'webhook_secret' => env('SACCO_DELIVERY_WEBHOOK_SECRET'),
        'webhook_url' => env('SACCO_DELIVERY_CALLBACK_URL'),
    ],

];
