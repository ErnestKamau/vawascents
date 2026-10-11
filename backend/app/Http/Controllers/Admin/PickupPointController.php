<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PickupPointRequest;
use App\Models\PickupPoint;
use Illuminate\Http\JsonResponse;

class PickupPointController extends Controller
{
    public function index(): JsonResponse
    {
        $points = PickupPoint::orderBy('town')->orderBy('name')->get();

        return response()->json(['data' => $points]);
    }

    public function update(PickupPointRequest $request, PickupPoint $pickupPoint): JsonResponse
    {
        $pickupPoint->update($request->validated());

        return response()->json(['data' => $pickupPoint->fresh()]);
    }
}
