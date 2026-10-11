<?php

namespace App\Services\Delivery;

use App\Enums\DeliveryStatus;
use App\Models\Order;
use App\Models\PickupPoint;

interface DeliveryProvider
{
    /**
     * @return array<int, PickupPointData>
     */
    public function findPickupPoints(float $lat, float $lng, float $radiusKm = 10.0): array;

    public function createBooking(Order $order, PickupPoint $point): DeliveryBookingResult;

    /**
     * Maps a raw status string from the provider's webhook payload onto our shared enum.
     * A passthrough today since both sides agreed on one vocabulary — kept as a seam
     * in case the provider's values ever drift from ours.
     */
    public function normalizeStatus(string $rawStatus): DeliveryStatus;
}
