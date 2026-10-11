<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    public function test_a_customer_is_forbidden_from_admin_endpoints(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->getJson('/api/admin/dashboard')
            ->assertForbidden();
    }

    public function test_a_guest_is_unauthorized_from_admin_endpoints(): void
    {
        $this->getJson('/api/admin/dashboard')->assertUnauthorized();
    }

    public function test_an_admin_can_reach_admin_endpoints(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->getJson('/api/admin/dashboard')
            ->assertOk();
    }
}
