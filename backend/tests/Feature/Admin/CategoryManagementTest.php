<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Tests\TestCase;

class CategoryManagementTest extends TestCase
{
    public function test_an_admin_can_create_a_category(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->postJson('/api/admin/categories', [
                'name' => 'Eau de Parfum',
                'slug' => 'eau-de-parfum',
            ])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'eau-de-parfum');

        $this->assertDatabaseHas('categories', ['slug' => 'eau-de-parfum']);
    }

    public function test_an_admin_can_update_a_category(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create(['name' => 'Old Name']);

        $this->actingAs($admin)
            ->putJson("/api/admin/categories/{$category->id}", [
                'name' => 'New Name',
                'slug' => $category->slug,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name');
    }

    public function test_a_category_with_products_cannot_be_deleted(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        Product::factory()->create(['category_id' => $category->id]);

        $this->actingAs($admin)
            ->deleteJson("/api/admin/categories/{$category->id}")
            ->assertStatus(409);

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_a_category_without_products_can_be_deleted(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/admin/categories/{$category->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }
}
