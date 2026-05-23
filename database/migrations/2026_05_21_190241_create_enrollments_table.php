<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('studentID')->constrained('users')->onDelete('cascade');
            $table->foreignId('courseID')->constrained('learning_contents')->onDelete('cascade');
            
            // Fix: pathID references learning_paths.pathID
            $table->unsignedBigInteger('pathID')->nullable();
            $table->foreign('pathID')->references('pathID')->on('learning_paths')->onDelete('set null');
            $table->integer('order')->default(0);

            $table->string('status')->default('active');
            $table->integer('progress')->default(0);
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->unique(['studentID', 'courseID']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('enrollments');
    }
};