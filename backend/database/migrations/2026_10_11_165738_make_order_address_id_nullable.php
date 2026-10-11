<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Delivery in this app is pickup-point based (sacco stages), not a home
     * address, and nothing in the product collects one — so an order no
     * longer requires an address. The foreign key itself doesn't need to be
     * dropped/recreated: a nullable column still enforces the constraint for
     * any non-null value, it just also permits null.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('address_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('address_id')->nullable(false)->change();
        });
    }
};
