<?php

namespace Tests\Feature\Orders;

use App\Models\Order;
use App\Models\User;
use Tests\TestCase;

class ConfirmPaymentTest extends TestCase
{
    public function test_confirming_payment_marks_the_order_paid_and_records_a_payment(): void
    {
        $user = User::factory()->create(['phone_verified_at' => now()]);
        $order = Order::factory()->create(['user_id' => $user->id, 'address_id' => null, 'status' => 'pending']);

        $this->actingAs($user)
            ->postJson("/api/orders/{$order->id}/payment", ['method' => 'mpesa'])
            ->assertOk()
            ->assertJsonPath('data.status', 'paid')
            ->assertJsonPath('data.payment.method', 'mpesa')
            ->assertJsonPath('data.payment.status', 'completed');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
        $this->assertDatabaseHas('payments', [
            'order_id' => $order->id,
            'method' => 'mpesa',
            'status' => 'completed',
            'amount_cents' => $order->total_cents,
        ]);
    }

    public function test_confirming_payment_twice_does_not_create_a_second_payment(): void
    {
        $user = User::factory()->create(['phone_verified_at' => now()]);
        $order = Order::factory()->create(['user_id' => $user->id, 'address_id' => null, 'status' => 'pending']);

        $this->actingAs($user)->postJson("/api/orders/{$order->id}/payment", ['method' => 'mpesa'])->assertOk();
        $this->actingAs($user)->postJson("/api/orders/{$order->id}/payment", ['method' => 'card'])->assertOk();

        $this->assertDatabaseCount('payments', 1);
        $this->assertDatabaseHas('payments', ['order_id' => $order->id, 'method' => 'mpesa']);
    }

    public function test_an_invalid_payment_method_is_rejected(): void
    {
        $user = User::factory()->create(['phone_verified_at' => now()]);
        $order = Order::factory()->create(['user_id' => $user->id, 'address_id' => null, 'status' => 'pending']);

        $this->actingAs($user)
            ->postJson("/api/orders/{$order->id}/payment", ['method' => 'cash_on_delivery'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['method']);
    }

    public function test_a_user_cannot_pay_for_another_users_order(): void
    {
        $owner = User::factory()->create(['phone_verified_at' => now()]);
        $other = User::factory()->create(['phone_verified_at' => now()]);
        $order = Order::factory()->create(['user_id' => $owner->id, 'address_id' => null, 'status' => 'pending']);

        $this->actingAs($other)
            ->postJson("/api/orders/{$order->id}/payment", ['method' => 'mpesa'])
            ->assertForbidden();
    }
}
