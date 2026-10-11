<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    private const LOW_STOCK_THRESHOLD = 5;

    public function __invoke(): JsonResponse
    {
        $revenue = [
            'today' => $this->revenueSince(now()->startOfDay()),
            'last_7_days' => $this->revenueSince(now()->subDays(7)),
            'last_30_days' => $this->revenueSince(now()->subDays(30)),
        ];

        $ordersByStatus = Order::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $lowStockVariants = ProductVariant::with('product')
            ->where('is_active', true)
            ->where('stock_quantity', '<=', self::LOW_STOCK_THRESHOLD)
            ->orderBy('stock_quantity')
            ->limit(20)
            ->get();

        $needsAttention = Order::with(['user', 'delivery'])
            ->where(function ($q) {
                $q->where('status', 'pending')
                    ->where('created_at', '<', now()->subHours(2));
            })
            ->orWhereHas('delivery', fn ($q) => $q->where('status', 'failed'))
            ->latest()
            ->limit(20)
            ->get();

        return response()->json([
            'data' => [
                'revenue_cents' => $revenue,
                'orders_by_status' => $ordersByStatus,
                'low_stock_variants' => $lowStockVariants,
                'needs_attention' => $needsAttention,
            ],
        ]);
    }

    private function revenueSince(\DateTimeInterface $since): int
    {
        return (int) Payment::where('status', 'completed')
            ->where('paid_at', '>=', $since)
            ->sum('amount_cents');
    }
}
