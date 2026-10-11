<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Http\Requests\Delivery\CreateDeliveryRequest;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\PickupPoint;
use App\Services\Delivery\DeliveryProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function __construct(private readonly DeliveryProvider $provider) {}

    public function store(CreateDeliveryRequest $request, Order $order): JsonResponse
    {
        $this->authorizeOwner($request, $order);

        $point = PickupPoint::findOrFail($request->integer('pickup_point_id'));

        $booking = $this->provider->createBooking($order, $point);

        $delivery = Delivery::create([
            'order_id' => $order->id,
            'pickup_point_id' => $point->id,
            'provider_reference' => $booking->providerReference,
            'status' => $booking->status,
            'estimated_arrival' => $booking->estimatedArrival,
        ]);

        return response()->json(['data' => $delivery], 201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOwner($request, $order);

        $delivery = $order->delivery()->with(['pickupPoint', 'statusEvents'])->firstOrFail();

        return response()->json(['data' => $delivery]);
    }

    private function authorizeOwner(Request $request, Order $order): void
    {
        abort_unless($order->user_id === $request->user()->id, 403);
    }
}
