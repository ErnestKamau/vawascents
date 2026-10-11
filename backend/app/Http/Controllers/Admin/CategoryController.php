<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::with('parent')->orderBy('name')->get();

        return response()->json(['data' => $categories]);
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return response()->json(['data' => $category], 201);
    }

    public function update(CategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());

        return response()->json(['data' => $category->fresh()]);
    }

    public function destroy(Category $category): JsonResponse
    {
        abort_if($category->products()->exists(), 409, 'Cannot delete a category with products assigned to it.');
        abort_if($category->children()->exists(), 409, 'Cannot delete a category with subcategories.');

        $category->delete();

        return response()->json(status: 204);
    }
}
