<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('courses') || !Schema::hasTable('learning_contents')) {
            return;
        }

        $legacyCourses = DB::table('learning_contents')
            ->where('type', 'course')
            ->orderBy('id')
            ->get();

        foreach ($legacyCourses as $legacyCourse) {
            DB::table('courses')->updateOrInsert(
                ['courseID' => $legacyCourse->id],
                [
                    'courseName' => $legacyCourse->title,
                    'description' => $legacyCourse->description,
                    'content' => $legacyCourse->content,
                    'difficultyLevel' => 'Beginner',
                    'isActive' => true,
                    'created_at' => $legacyCourse->created_at,
                    'updated_at' => $legacyCourse->updated_at,
                ]
            );
        }

        DB::table('learning_contents')
            ->where('type', 'topic')
            ->whereNotNull('parent_id')
            ->orderBy('id')
            ->chunkById(200, function ($topics) {
                foreach ($topics as $topic) {
                    DB::table('learning_contents')
                        ->where('id', $topic->id)
                        ->update([
                            'course_id' => $topic->parent_id,
                            'parent_id' => null,
                        ]);
                }
            });

        DB::table('learning_contents')
            ->where('type', 'course')
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // One-way migration: the legacy rows are not safely reversible because
        // course and topic IDs share the same key space in the old table.
    }
};