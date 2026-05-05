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
        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'content')) {
                $table->longText('content')->nullable()->after('description');
            }
        });

        Schema::table('learning_contents', function (Blueprint $table) {
            if (!Schema::hasColumn('learning_contents', 'course_id')) {
                $table->foreignId('course_id')
                    ->nullable()
                    ->after('parent_id')
                    ->constrained('courses', 'courseID')
                    ->cascadeOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('learning_contents', function (Blueprint $table) {
            if (Schema::hasColumn('learning_contents', 'course_id')) {
                $table->dropConstrainedForeignId('course_id');
            }
        });

        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'content')) {
                $table->dropColumn('content');
            }
        });
    }
};