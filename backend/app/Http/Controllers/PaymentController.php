<?php

namespace App\Http\Controllers;

use App\Http\Requests\Orders\ConfirmPaymentRequest;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Confirms payment for an order.
     *
     * No payment gateway (M-Pesa/Daraja, card processor, Equity Pesalink) is
     * integrated yet, so this simulates an immediate successful charge rather
     * than actually moving money. Swap the body of this method for a real
     * gateway call when one is wired up — the request/response shape is
     * designed to stay the same.
     */
    public function store(ConfirmPaymentRequest $request, Order $order): JsonResponse
    {
        $this->authorizeOwner($request, $order);

        if ($order->status === 'paid') {
            // Already paid (e.g. a retried tap) — return the existing state instead of double-charging.
            return response()->json(['data' => $order->load(['payment'])]);
        }

        abort_unless($order->status === 'pending', 409, 'Order is not awaiting payment.');

        DB::transaction(function () use ($request, $order): void {
            Payment::create([
                'order_id' => $order->id,
                'method' => $request->validated('method'),
                'status' => 'completed',
                'amount_cents' => $order->total_cents,
                'transaction_reference' => 'SIM-'.strtoupper(Str::random(10)),
                'paid_at' => now(),
            ]);

            $order->update([
                'status' => 'paid',
                'placed_at' => now(),
            ]);
        });

        return response()->json(['data' => $order->fresh()->load(['payment'])]);
    }

    private function authorizeOwner(Request $request, Order $order): void
    {
        abort_unless($order->user_id === $request->user()->id, 403);
    }
}
