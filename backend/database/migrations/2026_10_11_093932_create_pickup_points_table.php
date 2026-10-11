<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pickup_points', function (Blueprint $table) {
            $table->id();
            $table->string('provider_point_id')->unique();
            $table->string('name');
            $table->string('address');
            $table->string('town');
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->string('operating_hours')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pickup_points');
    }
};
