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
        if (!Schema::hasTable('topics')) {
            Schema::create('topics', function (Blueprint $table) {
                $table->id('topicID');
                $table->foreignId('courseID')
                      ->constrained('courses', 'courseID')
                      ->onDelete('cascade');
                $table->string('name', 255);
                $table->text('description')->nullable();
                $table->string('prerequisites', 255)->nullable()
                      ->comment('Comma-separated topicIDs required before this topic');
                $table->enum('difficultyLevel', ['Beginner', 'Intermediate', 'Advanced'])
                      ->default('Beginner');
                $table->unsignedInteger('orderIndex')
                      ->default(1)
                      ->comment('Order of topic within a course');
                $table->boolean('isActive')->default(true)
                      ->comment('Whether topic is published and visible');
                $table->timestamps(); // creates created_at and updated_at
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('topics');
        Schema::enableForeignKeyConstraints();
    }
};
