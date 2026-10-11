<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $deliveries = Delivery::with(['order.user', 'pickupPoint'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($deliveries);
    }

    public function show(Delivery $delivery): JsonResponse
    {
        return response()->json(['data' => $delivery->load(['order.user', 'pickupPoint', 'statusEvents'])]);
    }
}
