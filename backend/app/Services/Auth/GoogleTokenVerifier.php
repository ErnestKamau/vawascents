<?php

namespace App\Services\Auth;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleTokenVerifier
{
    private const CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

    private const ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

    /**
     * @return object{sub: string, email: string, email_verified: bool, name: ?string, picture: ?string}
     */
    public function verify(string $idToken): object
    {
        $certs = Cache::remember('google.oauth.certs', 3600, function (): array {
            return Http::get(self::CERTS_URL)->throw()->json();
        });

        $keys = JWK::parseKeySet($certs);
        $payload = JWT::decode($idToken, $keys);

        if (! in_array($payload->iss, self::ISSUERS, true)) {
            throw new RuntimeException('Unexpected token issuer.');
        }

        if (! in_array($payload->aud, config('services.google.client_ids'), true)) {
            throw new RuntimeException('Unexpected token audience.');
        }

        if (empty($payload->email_verified)) {
            throw new RuntimeException('Google account email is not verified.');
        }

        return $payload;
    }
}
