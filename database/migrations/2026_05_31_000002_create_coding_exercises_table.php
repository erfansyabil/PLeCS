<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coding_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('learning_contents')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('difficulty_level', ['Beginner', 'Intermediate', 'Advanced'])->default('Beginner');
            $table->unsignedInteger('points')->default(10);
            $table->longText('instructions');
            $table->longText('starter_code')->nullable();
            $table->json('test_cases');
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['course_id', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coding_exercises');
    }
};