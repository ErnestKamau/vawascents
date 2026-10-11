<?php

namespace App\Http\Requests\Admin;

use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'brand_id' => ['required', 'integer', 'exists:brands,id'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product)],
            'description' => ['nullable', 'string'],
            'gender' => ['required', Rule::in(['men', 'women', 'unisex'])],
            'thumbnail_url' => ['nullable', 'string', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],

            'variants' => ['required', 'array', 'min:1'],
            'variants.*.id' => ['sometimes', 'integer', Rule::exists('product_variants', 'id')->where('product_id', $product?->id)],
            'variants.*.sku' => ['required', 'string', 'max:255'],
            'variants.*.volume_ml' => ['required', 'integer', 'min:1'],
            'variants.*.price_cents' => ['required', 'integer', 'min:0'],
            'variants.*.stock_quantity' => ['required', 'integer', 'min:0'],
            'variants.*.is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $variants = collect($this->input('variants', []));
            $skus = $variants->pluck('sku')->filter();

            if ($skus->count() !== $skus->unique()->count()) {
                $validator->errors()->add('variants', 'Variant SKUs must be unique within this product.');

                return;
            }

            $ids = $variants->pluck('id')->filter();

            $taken = ProductVariant::whereIn('sku', $skus)
                ->when($ids->isNotEmpty(), fn ($q) => $q->whereNotIn('id', $ids))
                ->exists();

            if ($taken) {
                $validator->errors()->add('variants', 'One or more SKUs are already used by another product.');
            }
        });
    }
}
