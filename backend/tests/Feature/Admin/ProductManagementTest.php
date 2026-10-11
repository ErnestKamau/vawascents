<?php

namespace Tests\Feature\Admin;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Tests\TestCase;

class ProductManagementTest extends TestCase
{
    public function test_an_admin_can_create_a_product_with_variants(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $brand = Brand::factory()->create();
        $category = Category::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/admin/products', [
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'name' => 'Midnight Oud',
            'slug' => 'midnight-oud',
            'gender' => 'unisex',
            'variants' => [
                ['sku' => 'VWS-0001-A', 'volume_ml' => 50, 'price_cents' => 500000, 'stock_quantity' => 10],
                ['sku' => 'VWS-0001-B', 'volume_ml' => 100, 'price_cents' => 900000, 'stock_quantity' => 5],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonCount(2, 'data.variants');

        $this->assertDatabaseHas('products', ['slug' => 'midnight-oud']);
        $this->assertDatabaseHas('product_variants', ['sku' => 'VWS-0001-A', 'stock_quantity' => 10]);
    }

    public function test_updating_a_product_diffs_variants_add_update_remove(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create();
        $keep = ProductVariant::factory()->create(['product_id' => $product->id, 'sku' => 'KEEP-1', 'stock_quantity' => 1]);
        $remove = ProductVariant::factory()->create(['product_id' => $product->id, 'sku' => 'REMOVE-1']);

        $this->actingAs($admin)->putJson("/api/admin/products/{$product->id}", [
            'brand_id' => $product->brand_id,
            'category_id' => $product->category_id,
            'name' => $product->name,
            'slug' => $product->slug,
            'gender' => 'unisex',
            'variants' => [
                ['id' => $keep->id, 'sku' => 'KEEP-1', 'volume_ml' => 50, 'price_cents' => 1000, 'stock_quantity' => 99],
                ['sku' => 'NEW-1', 'volume_ml' => 30, 'price_cents' => 2000, 'stock_quantity' => 7],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('product_variants', ['id' => $keep->id, 'stock_quantity' => 99]);
        $this->assertDatabaseHas('product_variants', ['sku' => 'NEW-1']);
        $this->assertDatabaseMissing('product_variants', ['id' => $remove->id]);
    }

    public function test_duplicate_skus_within_a_product_are_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $brand = Brand::factory()->create();
        $category = Category::factory()->create();

        $this->actingAs($admin)->postJson('/api/admin/products', [
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'name' => 'Dup Test',
            'slug' => 'dup-test',
            'gender' => 'unisex',
            'variants' => [
                ['sku' => 'DUP-1', 'volume_ml' => 50, 'price_cents' => 1000, 'stock_quantity' => 1],
                ['sku' => 'DUP-1', 'volume_ml' => 30, 'price_cents' => 2000, 'stock_quantity' => 1],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors(['variants']);
    }
}
