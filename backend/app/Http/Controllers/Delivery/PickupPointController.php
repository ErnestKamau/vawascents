<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Http\Requests\Delivery\SearchPickupPointsRequest;
use App\Models\PickupPoint;
use App\Services\Delivery\DeliveryProvider;
use Illuminate\Http\JsonResponse;

class PickupPointController extends Controller
{
    public function __construct(private readonly DeliveryProvider $provider) {}

    public function __invoke(SearchPickupPointsRequest $request): JsonResponse
    {
        $lat = $request->float('lat');
        $lng = $request->float('lng');
        $radiusKm = $request->float('radius_km', 10.0);

        $points = array_map(
            fn ($data) => PickupPoint::updateOrCreate(
                ['provider_point_id' => $data->providerPointId],
                [
                    'name' => $data->name,
                    'address' => $data->address,
                    'town' => $data->town,
                    'lat' => $data->lat,
                    'lng' => $data->lng,
                    'operating_hours' => $data->operatingHours,
                    'synced_at' => now(),
                ],
            ),
            $this->provider->findPickupPoints($lat, $lng, $radiusKm),
        );

        return response()->json(['data' => $points]);
    }
}
