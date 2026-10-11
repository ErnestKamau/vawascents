<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /** @var array<int, string> */
    private const EAGER_LOADS = ['brand', 'category', 'variants'];

    public function index(Request $request): JsonResponse
    {
        $products = Product::with(self::EAGER_LOADS)
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->integer('category_id')))
            ->when($request->filled('brand_id'), fn ($q) => $q->where('brand_id', $request->integer('brand_id')))
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%'.$request->string('search').'%'))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($products);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => $product->load(self::EAGER_LOADS)]);
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $product = DB::transaction(function () use ($request) {
            $product = Product::create($request->safe()->except('variants'));

            foreach ($request->validated('variants') as $variant) {
                $product->variants()->create($variant);
            }

            return $product;
        });

        return response()->json(['data' => $product->load(self::EAGER_LOADS)], 201);
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        try {
            DB::transaction(function () use ($request, $product) {
                $product->update($request->safe()->except('variants'));

                $incoming = collect($request->validated('variants'));
                $keptIds = $incoming->pluck('id')->filter();

                $product->variants()->whereNotIn('id', $keptIds)->delete();

                foreach ($incoming as $variant) {
                    $product->variants()->updateOrCreate(
                        ['id' => $variant['id'] ?? null],
                        collect($variant)->except('id')->all(),
                    );
                }
            });
        } catch (QueryException $e) {
            abort(409, 'Cannot remove a variant that already has orders — deactivate it instead.');
        }

        return response()->json(['data' => $product->fresh(self::EAGER_LOADS)]);
    }

    public function destroy(Product $product): JsonResponse
    {
        try {
            DB::transaction(function () use ($product) {
                $product->variants()->delete();
                $product->delete();
            });
        } catch (QueryException $e) {
            abort(409, 'Cannot delete a product that already has orders — deactivate it instead.');
        }

        return response()->json(status: 204);
    }
}
