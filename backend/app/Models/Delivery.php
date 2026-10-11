<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use Database\Factories\DeliveryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['order_id', 'pickup_point_id', 'provider_reference', 'status', 'estimated_arrival'])]
class Delivery extends Model
{
    /** @use HasFactory<DeliveryFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => DeliveryStatus::class,
            'estimated_arrival' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function pickupPoint(): BelongsTo
    {
        return $this->belongsTo(PickupPoint::class);
    }

    public function statusEvents(): HasMany
    {
        return $this->hasMany(DeliveryStatusEvent::class)->orderBy('occurred_at');
    }
}
