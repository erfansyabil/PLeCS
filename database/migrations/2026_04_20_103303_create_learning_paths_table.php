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
        Schema::create('learning_paths', function (Blueprint $table) {
            $table->id('pathID');
            $table->foreignId('studentID')
                  ->constrained('users', 'id')
                  ->onDelete('cascade')
                  ->comment('References User table - Student role only');
            $table->foreignId('courseID')
                  ->constrained('courses', 'courseID')
                  ->onDelete('cascade');
            $table->string('pathName', 255);
            $table->enum('complexityLevel', ['Beginner', 'Intermediate', 'Advanced'])
                  ->default('Beginner');
            $table->boolean('isAdaptive')
                  ->default(true)
                  ->comment('True = AI-generated via Hugging Face API');
            $table->unsignedInteger('estimatedDuration')
                  ->default(0)
                  ->comment('Estimated duration in minutes');
            $table->float('currentProgress', 5, 2)
                  ->default(0.00)
                  ->comment('Completion percentage 0.00 to 100.00');
            $table->enum('status', ['Active', 'Completed', 'Paused'])
                  ->default('Active');
            $table->timestamps(); // creates created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_paths');
    }
};
