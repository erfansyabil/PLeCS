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
        Schema::create('learning_content_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_content_id')
                ->constrained('learning_contents')
                ->cascadeOnDelete();
            $table->unsignedBigInteger('topic_id')->nullable();
            $table->foreign('topic_id')->references('topicID')->on('topics')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('type', 20); // pdf, image
            $table->string('file_path');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_content_attachments');
    }
};
