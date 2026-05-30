<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coding_exercise_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coding_exercise_id')->constrained('coding_exercises')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->longText('submission_code');
            $table->unsignedInteger('score')->default(0);
            $table->unsignedInteger('max_score')->default(0);
            $table->boolean('passed')->default(false);
            $table->json('feedback')->nullable();
            $table->string('status')->default('submitted');
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            $table->index(['coding_exercise_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coding_exercise_attempts');
    }
};