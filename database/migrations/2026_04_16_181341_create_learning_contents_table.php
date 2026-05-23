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
        Schema::create('learning_contents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->string('type')->default('course'); // course, topic, etc.
            $table->enum('difficulty_level', ['Beginner', 'Intermediate', 'Advanced'])->nullable();
            $table->unsignedInteger('estimated_hours')->nullable();
            $table->text('keywords')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('learning_contents')->onDelete('cascade'); // for topics under courses
            $table->string('resource_type')->default('none');
            $table->text('resource_url')->nullable();
            $table->string('resource_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_contents');
    }
};
