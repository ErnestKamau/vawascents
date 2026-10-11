<?php

namespace App\Http\Controllers;

use App\Http\Requests\Orders\CreateOrderRequest;
use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /** @var array<int, string> */
    private const EAGER_LOADS = ['items', 'payment', 'delivery.pickupPoint', 'delivery.statusEvents'];

    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with(self::EAGER_LOADS)
            ->latest()
            ->get();

        return response()->json(['data' => $orders]);
    }

    public function store(CreateOrderRequest $request): JsonResponse
    {
        $items = collect($request->validated('items'));

        // Server-computed from the catalog — client-sent prices are never trusted.
        $variants = ProductVariant::with('product')
            ->whereIn('sku', $items->pluck('sku'))
            ->where('is_active', true)
            ->get()
            ->keyBy('sku');

        abort_if($variants->count() < $items->count(), 422, 'One or more items are no longer available.');

        $order = DB::transaction(function () use ($request, $items, $variants) {
            $subtotalCents = $items->sum(
                fn (array $item) => $variants[$item['sku']]->price_cents * $item['quantity']
            );

            $order = Order::create([
                'user_id' => $request->user()->id,
                'address_id' => null,
                'order_number' => 'ORD-'.strtoupper(Str::random(8)),
                'status' => 'pending',
                'subtotal_cents' => $subtotalCents,
                'shipping_cents' => 0,
                'total_cents' => $subtotalCents,
            ]);

            foreach ($items as $item) {
                $variant = $variants[$item['sku']];

                $order->items()->create([
                    'product_variant_id' => $variant->id,
                    'product_name' => $variant->product->name,
                    'sku' => $variant->sku,
                    'unit_price_cents' => $variant->price_cents,
                    'quantity' => $item['quantity'],
                    'subtotal_cents' => $variant->price_cents * $item['quantity'],
                ]);
            }

            return $order;
        });

        return response()->json(['data' => $order->load(self::EAGER_LOADS)], 201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOwner($request, $order);

        return response()->json(['data' => $order->load(self::EAGER_LOADS)]);
    }

    private function authorizeOwner(Request $request, Order $order): void
    {
        abort_unless($order->user_id === $request->user()->id, 403);
    }
}
