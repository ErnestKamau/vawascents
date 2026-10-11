<?php

namespace App\Services\Delivery;

/**
 * Normalized pickup point as returned by a DeliveryProvider, before it's cached into the pickup_points table.
 */
readonly class PickupPointData
{
    public function __construct(
        public string $providerPointId,
        public string $name,
        public string $address,
        public string $town,
        public float $lat,
        public float $lng,
        public ?string $operatingHours = null,
    ) {}
}
