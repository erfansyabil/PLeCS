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
            $table->json('path_data')->nullable();
            $table->softDeletes();
            $table->timestamps(); // creates created_at and updated_at
        });
        
        Schema::create('learning_path_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pathID')
                  ->constrained('learning_paths', 'pathID')
                  ->onDelete('cascade');
            $table->foreignId('courseID')
                  ->constrained('learning_contents', 'id')
                  ->onDelete('cascade');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['pathID', 'courseID']);
            $table->index(['pathID', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
      Schema::disableForeignKeyConstraints();
      Schema::dropIfExists('learning_path_courses');
      Schema::dropIfExists('learning_paths');
      Schema::enableForeignKeyConstraints();
    }
};
