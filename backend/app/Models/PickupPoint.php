<?php

namespace App\Models;

use Database\Factories\PickupPointFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['provider_point_id', 'name', 'address', 'town', 'lat', 'lng', 'operating_hours', 'is_active', 'synced_at'])]
class PickupPoint extends Model
{
    /** @use HasFactory<PickupPointFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
            'is_active' => 'boolean',
            'synced_at' => 'datetime',
        ];
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class);
    }
}
