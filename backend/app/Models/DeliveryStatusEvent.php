<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use Database\Factories\DeliveryStatusEventFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['delivery_id', 'status', 'occurred_at', 'notes', 'raw_payload'])]
class DeliveryStatusEvent extends Model
{
    /** @use HasFactory<DeliveryStatusEventFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => DeliveryStatus::class,
            'occurred_at' => 'datetime',
            'raw_payload' => 'array',
        ];
    }

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class);
    }
}
