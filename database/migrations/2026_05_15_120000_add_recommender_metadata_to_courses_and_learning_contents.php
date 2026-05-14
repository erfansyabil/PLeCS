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
        if (Schema::hasTable('learning_contents')) {
            Schema::table('learning_contents', function (Blueprint $table) {
                if (!Schema::hasColumn('learning_contents', 'estimated_hours')) {
                    $table->unsignedInteger('estimated_hours')->nullable()->after('difficulty_level');
                }

                if (!Schema::hasColumn('learning_contents', 'keywords')) {
                    $table->text('keywords')->nullable()->after('estimated_hours');
                }
            });
        }

        if (Schema::hasTable('courses')) {
            Schema::table('courses', function (Blueprint $table) {
                if (!Schema::hasColumn('courses', 'estimatedHours')) {
                    $table->unsignedInteger('estimatedHours')->nullable()->after('difficultyLevel');
                }

                if (!Schema::hasColumn('courses', 'keywords')) {
                    $table->text('keywords')->nullable()->after('estimatedHours');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('courses')) {
            Schema::table('courses', function (Blueprint $table) {
                if (Schema::hasColumn('courses', 'keywords')) {
                    $table->dropColumn('keywords');
                }

                if (Schema::hasColumn('courses', 'estimatedHours')) {
                    $table->dropColumn('estimatedHours');
                }
            });
        }

        if (Schema::hasTable('learning_contents')) {
            Schema::table('learning_contents', function (Blueprint $table) {
                if (Schema::hasColumn('learning_contents', 'keywords')) {
                    $table->dropColumn('keywords');
                }

                if (Schema::hasColumn('learning_contents', 'estimated_hours')) {
                    $table->dropColumn('estimated_hours');
                }
            });
        }
    }
};
