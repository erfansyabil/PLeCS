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
        if (!Schema::hasTable('topics') || !Schema::hasTable('learning_contents')) {
            return;
        }

        // Copy learning_contents rows of type 'topic' into topics table.
        $topics = DB::table('learning_contents')
            ->where('type', 'topic')
            ->get();

        foreach ($topics as $t) {
            // Avoid duplicate inserts if migration run twice
            $exists = DB::table('topics')->where('topicID', $t->id)->exists();
            if ($exists) {
                continue;
            }

            $parentCourse = DB::table('learning_contents')
                ->where('id', $t->parent_id)
                ->where('type', 'course')
                ->first();

            if (!$parentCourse) {
                continue;
            }

            // Ensure a matching legacy course row exists for FK integrity.
            DB::table('courses')->updateOrInsert(
                ['courseID' => $parentCourse->id],
                [
                    'courseName' => $parentCourse->title,
                    'description' => $parentCourse->description,
                    'difficultyLevel' => 'Beginner',
                    'isActive' => true,
                    'created_at' => $parentCourse->created_at,
                    'updated_at' => now(),
                ]
            );

            // Only insert if a matching course exists in the legacy `courses` table.
            $courseExists = DB::table('courses')->where('courseID', $t->parent_id)->exists();
            if (!$courseExists) {
                continue;
            }

            DB::table('topics')->insert([
                'topicID' => $t->id,
                'courseID' => $t->parent_id,
                'name' => $t->title,
                'description' => $t->description,
                'prerequisites' => null,
                'difficultyLevel' => 'Beginner',
                'orderIndex' => 1,
                'isActive' => true,
                'created_at' => $t->created_at,
                'updated_at' => $t->updated_at,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('topics') || !Schema::hasTable('learning_contents')) {
            return;
        }

        $topicIds = DB::table('learning_contents')
            ->where('type', 'topic')
            ->pluck('id')
            ->toArray();

        DB::table('topics')->whereIn('topicID', $topicIds)->delete();
    }
};
