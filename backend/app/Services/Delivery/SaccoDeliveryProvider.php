<?php

namespace App\Services\Delivery;

use App\Enums\DeliveryStatus;
use App\Models\Order;
use App\Models\PickupPoint;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Talks to the sacco partner's delivery API — see the delivery API contract notes
 * (pickup-point search, booking, status webhook, shared DeliveryStatus vocabulary).
 */
class SaccoDeliveryProvider implements DeliveryProvider
{
    public function findPickupPoints(float $lat, float $lng, float $radiusKm = 10.0): array
    {
        $response = $this->client()->get('/api/v1/pickup-points', [
            'lat' => $lat,
            'lng' => $lng,
            'radius_km' => $radiusKm,
        ]);

        if ($response->failed()) {
            throw new RuntimeException("Sacco pickup-points request failed: {$response->status()} {$response->body()}");
        }

        return array_map(
            fn (array $point) => new PickupPointData(
                providerPointId: $point['id'],
                name: $point['name'],
                address: $point['address'],
                town: $point['town'],
                lat: (float) $point['lat'],
                lng: (float) $point['lng'],
                operatingHours: $point['operating_hours'] ?? null,
            ),
            $response->json(),
        );
    }

    public function createBooking(Order $order, PickupPoint $point): DeliveryBookingResult
    {
        $response = $this->client()->post('/api/v1/deliveries', [
            'order_reference' => $order->order_number,
            'pickup_point_id' => $point->provider_point_id,
            'recipient' => [
                'name' => $order->address->recipient_name,
                'phone' => $order->address->phone,
            ],
            'parcel' => [
                'description' => "Order {$order->order_number}",
            ],
            'callback_url' => config('services.sacco.webhook_url'),
        ]);

        if ($response->failed()) {
            throw new RuntimeException("Sacco booking request failed: {$response->status()} {$response->body()}");
        }

        $data = $response->json();

        return new DeliveryBookingResult(
            providerReference: $data['provider_reference'],
            status: $this->normalizeStatus($data['status']),
            estimatedArrival: isset($data['estimated_arrival']) ? Carbon::parse($data['estimated_arrival']) : null,
        );
    }

    public function normalizeStatus(string $rawStatus): DeliveryStatus
    {
        return DeliveryStatus::from($rawStatus);
    }

    private function client(): PendingRequest
    {
        $config = config('services.sacco');

        return Http::baseUrl($config['base_url'])
            ->withToken($config['api_key']);
    }
}
