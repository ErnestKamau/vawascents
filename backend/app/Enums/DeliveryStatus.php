<?php

namespace App\Enums;

/**
 * Shared vocabulary with the sacco delivery API — see delivery API contract docs.
 * Both sides use these exact values, so no status-mapping layer is needed on day one.
 */
enum DeliveryStatus: string
{
    case Booked = 'booked';
    case Dispatched = 'dispatched';
    case AtHub = 'at_hub';
    case WithDriver = 'with_driver';
    case AtPickupPoint = 'at_pickup_point';
    case Collected = 'collected';
    case Failed = 'failed';
    case Returned = 'returned';

    public function label(): string
    {
        return match ($this) {
            self::Booked => 'Booking confirmed',
            self::Dispatched => 'Dispatched',
            self::AtHub => 'Arrived at hub',
            self::WithDriver => 'Out for delivery',
            self::AtPickupPoint => 'Ready for pickup',
            self::Collected => 'Collected',
            self::Failed => 'Delivery failed',
            self::Returned => 'Returned to sender',
        };
    }
}
