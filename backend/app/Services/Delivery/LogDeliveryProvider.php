<?php

namespace App\Services\Delivery;

use App\Enums\DeliveryStatus;
use App\Models\Order;
use App\Models\PickupPoint;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Stub provider used until the sacco's delivery API is live.
 * Logs instead of calling out, and returns a single fake pickup point so the rest of
 * the ordering flow (pickup-point selection, booking, status timeline) can be built and tested now.
 */
class LogDeliveryProvider implements DeliveryProvider
{
    public function findPickupPoints(float $lat, float $lng, float $radiusKm = 10.0): array
    {
        Log::info('Delivery (stub): find pickup points', ['lat' => $lat, 'lng' => $lng, 'radius_km' => $radiusKm]);

        return [
            new PickupPointData(
                providerPointId: 'STUB-POINT-1',
                name: 'CBD Stage (stub)',
                address: 'Tom Mboya Street',
                town: 'Nairobi',
                lat: $lat,
                lng: $lng,
                operatingHours: '06:00-21:00',
            ),
        ];
    }

    public function createBooking(Order $order, PickupPoint $point): DeliveryBookingResult
    {
        $reference = 'STUB-'.Str::upper(Str::random(10));

        Log::info('Delivery (stub): booking created', [
            'order_id' => $order->id,
            'pickup_point_id' => $point->id,
            'provider_reference' => $reference,
        ]);

        return new DeliveryBookingResult(
            providerReference: $reference,
            status: DeliveryStatus::Booked,
            estimatedArrival: now()->addDays(2),
        );
    }

    public function normalizeStatus(string $rawStatus): DeliveryStatus
    {
        return DeliveryStatus::from($rawStatus);
    }
}
