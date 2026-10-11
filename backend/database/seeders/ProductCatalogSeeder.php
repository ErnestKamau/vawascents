<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

/**
 * Seeds the catalog the mobile app already displays (mobile/src/data/mockProducts.ts)
 * as real Product/ProductVariant rows. Each variant's `sku` matches a mock
 * product's `id` 1:1, so the mobile app can create orders by sku without
 * knowing any backend-internal numeric id.
 */
class ProductCatalogSeeder extends Seeder
{
    /**
     * @var array<int, array{sku: string, name: string, gender: 'men'|'women'|'unisex', volumeMl: int, priceCents: int}>
     */
    private const PRODUCTS = [
        ['sku' => 'velvet-noir', 'name' => 'Velvet Noir', 'gender' => 'women', 'volumeMl' => 50, 'priceCents' => 650000],
        ['sku' => 'ocean-mist', 'name' => 'Ocean Mist', 'gender' => 'men', 'volumeMl' => 100, 'priceCents' => 720000],
        ['sku' => 'rose-aura', 'name' => 'Rose Aura', 'gender' => 'unisex', 'volumeMl' => 75, 'priceCents' => 540000],
        ['sku' => 'amber-dusk', 'name' => 'Amber Dusk', 'gender' => 'men', 'volumeMl' => 100, 'priceCents' => 890000],
        ['sku' => 'citrus-bloom', 'name' => 'Citrus Bloom', 'gender' => 'women', 'volumeMl' => 50, 'priceCents' => 480000],
        ['sku' => 'golden-hour', 'name' => 'Golden Hour', 'gender' => 'unisex', 'volumeMl' => 100, 'priceCents' => 990000],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brand = Brand::firstOrCreate(
            ['slug' => 'vawascents'],
            ['name' => 'VawaScents', 'is_active' => true],
        );

        $categories = collect(['women', 'men', 'unisex'])->mapWithKeys(fn (string $gender) => [
            $gender => Category::firstOrCreate(
                ['slug' => $gender],
                ['name' => ucfirst($gender), 'is_active' => true],
            ),
        ]);

        foreach (self::PRODUCTS as $entry) {
            $product = Product::updateOrCreate(
                ['slug' => $entry['sku']],
                [
                    'brand_id' => $brand->id,
                    'category_id' => $categories[$entry['gender']]->id,
                    'name' => $entry['name'],
                    'gender' => $entry['gender'],
                    'is_active' => true,
                ],
            );

            ProductVariant::updateOrCreate(
                ['sku' => $entry['sku']],
                [
                    'product_id' => $product->id,
                    'volume_ml' => $entry['volumeMl'],
                    'price_cents' => $entry['priceCents'],
                    'stock_quantity' => 100,
                    'is_active' => true,
                ],
            );
        }
    }
}
