<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('learning_contents') || ! Schema::hasTable('courses')) {
            return;
        }

        // Add additional columns to `courses` to store learning content fields if missing.
        Schema::table('courses', function (Blueprint $table) {
            if (! Schema::hasColumn('courses', 'content')) {
                $table->longText('content')->nullable()->after('description');
            }

            if (! Schema::hasColumn('courses', 'resource_type')) {
                $table->string('resource_type')->nullable()->after('content');
            }

            if (! Schema::hasColumn('courses', 'resource_url')) {
                $table->string('resource_url')->nullable()->after('resource_type');
            }

            if (! Schema::hasColumn('courses', 'resource_path')) {
                $table->string('resource_path')->nullable()->after('resource_url');
            }
        });

        // Copy course rows from learning_contents into courses (non-destructive).
        $courses = DB::table('learning_contents')
            ->where('type', 'course')
            ->orderBy('id')
            ->get();

        foreach ($courses as $c) {
            DB::table('courses')->updateOrInsert(
                ['courseID' => $c->id],
                [
                    'courseName' => $c->title,
                    'description' => $c->description,
                    'content' => $c->content ?? null,
                    // Map difficulty_level -> difficultyLevel if present; fallback to Beginner
                    'difficultyLevel' => $c->difficulty_level ?? ($c->difficultyLevel ?? 'Beginner'),
                    'isActive' => true,
                    'resource_type' => $c->resource_type ?? null,
                    'resource_url' => $c->resource_url ?? null,
                    'resource_path' => $c->resource_path ?? null,
                    'created_at' => $c->created_at ?? now(),
                    'updated_at' => $c->updated_at ?? now(),
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('courses')) {
            return;
        }

        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'resource_path')) {
                $table->dropColumn('resource_path');
            }

            if (Schema::hasColumn('courses', 'resource_url')) {
                $table->dropColumn('resource_url');
            }

            if (Schema::hasColumn('courses', 'resource_type')) {
                $table->dropColumn('resource_type');
            }

            if (Schema::hasColumn('courses', 'content')) {
                $table->dropColumn('content');
            }
        });
    }
};
