<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // sqlite (used in tests) emulates enums as a CHECK constraint set at table
        // creation and has no ALTER COLUMN; only MySQL needs this statement.
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE payments MODIFY method ENUM('mpesa', 'card', 'pesalink', 'wallet') NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE payments MODIFY method ENUM('mpesa', 'card', 'cash_on_delivery', 'wallet') NOT NULL");
        }
    }
};
