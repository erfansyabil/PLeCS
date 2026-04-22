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
        Schema::create('learning_content_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_content_id')
                ->constrained('learning_contents')
                ->cascadeOnDelete();
            $table->string('type', 20); // text, youtube, pdf, image
            $table->string('title')->nullable();
            $table->longText('content')->nullable();
            $table->text('url')->nullable();
            $table->string('file_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_content_blocks');
    }
};
