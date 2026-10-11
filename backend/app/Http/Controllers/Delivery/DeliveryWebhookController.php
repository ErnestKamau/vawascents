<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Jobs\SendDeliveryStatusPush;
use App\Models\Delivery;
use App\Services\Delivery\DeliveryProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DeliveryWebhookController extends Controller
{
    public function __construct(private readonly DeliveryProvider $provider) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider_reference' => ['required', 'string'],
            'status' => ['required', 'string'],
            'occurred_at' => ['required', 'date'],
            'notes' => ['sometimes', 'string'],
        ]);

        $delivery = Delivery::where('provider_reference', $validated['provider_reference'])->firstOrFail();
        $status = $this->provider->normalizeStatus($validated['status']);

        $event = $delivery->statusEvents()->firstOrCreate(
            ['status' => $status->value],
            [
                'occurred_at' => Carbon::parse($validated['occurred_at']),
                'notes' => $validated['notes'] ?? null,
                'raw_payload' => $request->all(),
            ],
        );

        if ($event->wasRecentlyCreated) {
            $delivery->update(['status' => $status]);
            SendDeliveryStatusPush::dispatch($event);
        }

        return response()->json(['received' => true]);
    }
}
