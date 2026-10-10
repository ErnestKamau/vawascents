<?php

namespace Tests\Unit;

use App\Http\Middleware\EnsurePhoneIsVerified;
use App\Models\User;
use Illuminate\Http\Request;
use Tests\TestCase;

class EnsurePhoneIsVerifiedTest extends TestCase
{
    public function test_it_blocks_a_user_without_a_verified_phone(): void
    {
        $user = User::factory()->create(['phone_verified_at' => null]);
        $request = Request::create('/api/whatever');
        $request->setUserResolver(fn () => $user);

        $response = (new EnsurePhoneIsVerified)->handle($request, fn () => response('ok'));

        $this->assertSame(403, $response->getStatusCode());
    }

    public function test_it_allows_a_user_with_a_verified_phone(): void
    {
        $user = User::factory()->create(['phone_verified_at' => now()]);
        $request = Request::create('/api/whatever');
        $request->setUserResolver(fn () => $user);

        $response = (new EnsurePhoneIsVerified)->handle($request, fn () => response('ok'));

        $this->assertSame(200, $response->getStatusCode());
    }
}
