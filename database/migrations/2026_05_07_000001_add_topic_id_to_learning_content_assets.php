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
        if (!Schema::hasTable('learning_content_blocks') || !Schema::hasTable('learning_content_attachments')) {
            return;
        }

        if (!Schema::hasColumn('learning_content_blocks', 'topic_id')) {
            Schema::table('learning_content_blocks', function (Blueprint $table) {
                $table->unsignedBigInteger('topic_id')->nullable()->after('learning_content_id');
                $table->foreign('topic_id')->references('topicID')->on('topics')->cascadeOnDelete();
            });
        }

        if (!Schema::hasColumn('learning_content_attachments', 'topic_id')) {
            Schema::table('learning_content_attachments', function (Blueprint $table) {
                $table->unsignedBigInteger('topic_id')->nullable()->after('learning_content_id');
                $table->foreign('topic_id')->references('topicID')->on('topics')->cascadeOnDelete();
            });
        }

        $driver = DB::getDriverName();

        // MySQL path: allow topic-owned assets that are not tied to learning_contents.
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE learning_content_blocks MODIFY learning_content_id BIGINT UNSIGNED NULL');
            DB::statement('ALTER TABLE learning_content_attachments MODIFY learning_content_id BIGINT UNSIGNED NULL');

            // Backfill topic_id where old records pointed to topic ids in learning_content_id.
            DB::statement('UPDATE learning_content_blocks b INNER JOIN topics t ON t.topicID = b.learning_content_id SET b.topic_id = b.learning_content_id WHERE b.topic_id IS NULL');
            DB::statement('UPDATE learning_content_attachments a INNER JOIN topics t ON t.topicID = a.learning_content_id SET a.topic_id = a.learning_content_id WHERE a.topic_id IS NULL');

            return;
        }

        // Portable backfill for non-MySQL connections (e.g., sqlite in tests).
        $topicIds = DB::table('topics')->pluck('topicID')->all();

        if (!empty($topicIds)) {
            DB::table('learning_content_blocks')
                ->whereNull('topic_id')
                ->whereIn('learning_content_id', $topicIds)
                ->update(['topic_id' => DB::raw('learning_content_id')]);

            DB::table('learning_content_attachments')
                ->whereNull('topic_id')
                ->whereIn('learning_content_id', $topicIds)
                ->update(['topic_id' => DB::raw('learning_content_id')]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally no-op: reverting nullable columns and dropping topic_id would be destructive.
    }
};
