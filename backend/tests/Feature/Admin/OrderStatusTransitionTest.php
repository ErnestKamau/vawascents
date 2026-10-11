<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\User;
use Tests\TestCase;

class OrderStatusTransitionTest extends TestCase
{
    public function test_an_admin_can_advance_a_paid_order_to_processing(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create(['status' => 'paid']);

        $this->actingAs($admin)
            ->patchJson("/api/admin/orders/{$order->id}/status", ['status' => 'processing'])
            ->assertOk()
            ->assertJsonPath('data.status', 'processing');
    }

    public function test_an_order_cannot_skip_from_paid_to_delivered(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create(['status' => 'paid']);

        $this->actingAs($admin)
            ->patchJson("/api/admin/orders/{$order->id}/status", ['status' => 'delivered'])
            ->assertStatus(409);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    }

    public function test_a_pending_order_can_be_cancelled_but_not_processed(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create(['status' => 'pending']);

        $this->actingAs($admin)
            ->patchJson("/api/admin/orders/{$order->id}/status", ['status' => 'cancelled'])
            ->assertOk();

        $order2 = Order::factory()->create(['status' => 'pending']);
        $this->actingAs($admin)
            ->patchJson("/api/admin/orders/{$order2->id}/status", ['status' => 'processing'])
            ->assertStatus(409);
    }
}
