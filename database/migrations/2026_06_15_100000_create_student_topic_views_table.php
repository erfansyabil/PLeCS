<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_topic_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('topic_id');
            $table->foreign('topic_id')->references('topicID')->on('topics')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['student_id', 'topic_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_topic_views');
    }
};
