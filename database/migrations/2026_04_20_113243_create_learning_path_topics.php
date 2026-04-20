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
        Schema::create('learning_path_topics', function (Blueprint $table) {
            $table->id('pathTopicID');
            $table->foreignId('pathID')
                  ->constrained('learning_paths', 'pathID')
                  ->onDelete('cascade');
            $table->foreignId('topicID')
                  ->constrained('topics', 'topicID')
                  ->onDelete('cascade');
            $table->unsignedInteger('orderIndex')
                  ->default(1)
                  ->comment('Order of this topic within the student learning path');
            $table->boolean('isCompleted')
                  ->default(false)
                  ->comment('Whether the student has completed this topic');
            $table->timestamp('completedAt')
                  ->nullable()
                  ->comment('Timestamp when the student completed this topic');
 
            // Prevent duplicate topic entries in the same learning path
            $table->unique(['pathID', 'topicID']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_path_topics');
    }
};
