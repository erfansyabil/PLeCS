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
        Schema::create('analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('course_id');
            $table->foreign('course_id')->references('id')->on('learning_contents')->cascadeOnDelete();
            $table->unsignedBigInteger('topic_id');
            $table->foreign('topic_id')->references('topicID')->on('topics')->cascadeOnDelete();
            $table->float('completion_rate')->default(0);     // % of quizzes passed in topic
            $table->float('average_score')->default(0);       // avg score % across attempts
            $table->date('predicted_mastery_date')->nullable();
            $table->json('weak_topics')->nullable();           // topic names where avg < 60%
            $table->boolean('risk_flag')->default(false);      // true if avg_score < 50%
            $table->timestamps();
            $table->unique(['student_id', 'topic_id']);        // one record per student per topic
            $table->index(['student_id', 'course_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics');
    }
};
