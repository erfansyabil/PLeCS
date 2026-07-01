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
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('topic_id');
            $table->foreign('topic_id')->references('topicID')->on('topics')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating')->nullable();  // 1-5, null if skipped
            $table->text('comment')->nullable();
            $table->json('tags')->nullable();                   // ["Easy to understand", ...]
            $table->boolean('skipped')->default(false);
            $table->timestamps();
            $table->unique(['student_id', 'topic_id']);         // one feedback per student per topic
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};
