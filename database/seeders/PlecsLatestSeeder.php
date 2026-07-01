<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class PlecsLatestSeeder extends Seeder
{
    /**
     * Tables to restore from the dump, in an order that satisfies
     * foreign keys once constraints are re-enabled.
     */
    private const TABLES = [
        'users',
        'learning_contents',
        'topics',
        'learning_content_blocks',
        'learning_content_prerequisites',
        'learning_paths',
        'learning_path_courses',
        'quizzes',
        'enrollments',
    ];

    /**
     * Replay the real data from plecs_latest.sql (a phpMyAdmin dump of the
     * production database) into a fresh database.
     */
    public function run(): void
    {
        $path = base_path('plecs_latest.sql');

        if (!file_exists($path)) {
            throw new RuntimeException("Dump file not found: {$path}");
        }

        $sql = file_get_contents($path);

        Schema::disableForeignKeyConstraints();

        foreach (self::TABLES as $table) {
            DB::table($table)->truncate();
        }

        foreach (self::TABLES as $table) {
            $statements = $this->extractInsertStatements($sql, $table);

            foreach ($statements as $statement) {
                // The dump was exported from MariaDB with zero-dates allowed;
                // strict MySQL rejects them, so treat them as NULL instead.
                $statement = str_replace("'0000-00-00'", 'NULL', $statement);

                DB::unprepared($statement);
            }
        }

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Pull every "INSERT INTO `$table` ... ;" statement for a given table
     * out of the raw dump text.
     *
     * @return string[]
     */
    private function extractInsertStatements(string $sql, string $table): array
    {
        preg_match_all(
            '/^INSERT INTO `'.preg_quote($table, '/').'`.*?;$/ms',
            $sql,
            $matches
        );

        return $matches[0];
    }
}
