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
        Schema::table('learning_contents', function (Blueprint $table) {
            $table->string('resource_type')->default('none')->after('parent_id');
            $table->text('resource_url')->nullable()->after('resource_type');
            $table->string('resource_path')->nullable()->after('resource_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('learning_contents', function (Blueprint $table) {
            $table->dropColumn(['resource_type', 'resource_url', 'resource_path']);
        });
    }
};
