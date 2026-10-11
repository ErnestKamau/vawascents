<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /** @var array<int, string> */
    private const EAGER_LOADS = ['user', 'items', 'payment', 'delivery.pickupPoint', 'delivery.statusEvents'];

    /** @var array<string, array<int, string>> */
    private const ALLOWED_TRANSITIONS = [
        'pending' => ['cancelled'],
        'paid' => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['delivered'],
    ];

    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['user', 'payment', 'delivery'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('search'), fn ($q) => $q->where('order_number', 'like', '%'.$request->string('search').'%'))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json(['data' => $order->load(self::EAGER_LOADS)]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $next = $request->validated('status');
        $allowed = self::ALLOWED_TRANSITIONS[$order->status] ?? [];

        abort_unless(in_array($next, $allowed, true), 409, "Cannot move an order from '{$order->status}' to '{$next}'.");

        $order->update(['status' => $next]);

        return response()->json(['data' => $order->fresh()->load(self::EAGER_LOADS)]);
    }
}
