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
        Schema::table('guidance', function (Blueprint $table) {
            $table->dropForeign(['topic_id']);
        });

        Schema::table('guidance', function (Blueprint $table) {
            $table->unsignedBigInteger('topic_id')->nullable()->change();
            $table->foreign('topic_id')->references('topicID')->on('topics')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guidance', function (Blueprint $table) {
            $table->dropForeign(['topic_id']);
        });

        Schema::table('guidance', function (Blueprint $table) {
            $table->unsignedBigInteger('topic_id')->nullable(false)->change();
            $table->foreign('topic_id')->references('topicID')->on('topics')->cascadeOnDelete();
        });
    }
};
