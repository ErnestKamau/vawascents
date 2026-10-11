<?php

namespace Tests\Feature\Orders;

use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Tests\TestCase;

class CreateOrderTest extends TestCase
{
    public function test_a_verified_user_can_create_an_order_with_server_computed_prices(): void
    {
        $user = User::factory()->create(['phone_verified_at' => now()]);
        $variant = ProductVariant::factory()->create(['price_cents' => 650000]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'items' => [
                // A client-sent price is ignored entirely — the endpoint doesn't accept one.
                ['sku' => $variant->sku, 'quantity' => 2],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.subtotal_cents', 1300000)
            ->assertJsonPath('data.total_cents', 1300000)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.items.0.sku', $variant->sku)
            ->assertJsonPath('data.items.0.quantity', 2)
            ->assertJsonPath('data.items.0.unit_price_cents', 650000);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'subtotal_cents' => 1300000,
            'address_id' => null,
        ]);
        $this->assertDatabaseHas('order_items', [
            'product_variant_id' => $variant->id,
            'quantity' => 2,
            'subtotal_cents' => 1300000,
        ]);
    }

    public function test_an_unknown_sku_is_rejected_with_a_validation_error(): void
    {
        $user = User::factory()->create(['phone_verified_at' => now()]);

        $this->actingAs($user)
            ->postJson('/api/orders', ['items' => [['sku' => 'does-not-exist', 'quantity' => 1]]])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['items.0.sku']);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_a_user_cannot_view_another_users_order(): void
    {
        $owner = User::factory()->create(['phone_verified_at' => now()]);
        $other = User::factory()->create(['phone_verified_at' => now()]);
        $order = Order::factory()->create(['user_id' => $owner->id, 'address_id' => null]);

        $this->actingAs($other)
            ->getJson("/api/orders/{$order->id}")
            ->assertForbidden();
    }

    public function test_an_unverified_phone_cannot_create_an_order(): void
    {
        $user = User::factory()->create(['phone_verified_at' => null]);

        $this->actingAs($user)
            ->postJson('/api/orders', ['items' => []])
            ->assertForbidden();
    }
}
