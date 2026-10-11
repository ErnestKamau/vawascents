<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $payments = Payment::with('order.user')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('method'), fn ($q) => $q->where('method', $request->string('method')))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($payments);
    }

    public function show(Payment $payment): JsonResponse
    {
        return response()->json(['data' => $payment->load('order.user')]);
    }

    /**
     * Manual reconciliation only — no payment gateway is integrated yet, so
     * this just flips the record to `refunded`. Swap for a real gateway
     * refund call once one is wired up, same caveat as PaymentController::store.
     */
    public function refund(Payment $payment): JsonResponse
    {
        abort_unless($payment->status === 'completed', 409, 'Only a completed payment can be refunded.');

        $payment->update(['status' => 'refunded']);

        return response()->json(['data' => $payment->fresh()->load('order.user')]);
    }
}
