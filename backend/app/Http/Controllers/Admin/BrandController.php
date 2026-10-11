<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BrandRequest;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Brand::orderBy('name')->get();

        return response()->json(['data' => $brands]);
    }

    public function store(BrandRequest $request): JsonResponse
    {
        $brand = Brand::create($request->validated());

        return response()->json(['data' => $brand], 201);
    }

    public function update(BrandRequest $request, Brand $brand): JsonResponse
    {
        $brand->update($request->validated());

        return response()->json(['data' => $brand->fresh()]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        abort_if($brand->products()->exists(), 409, 'Cannot delete a brand with products assigned to it.');

        $brand->delete();

        return response()->json(status: 204);
    }
}
