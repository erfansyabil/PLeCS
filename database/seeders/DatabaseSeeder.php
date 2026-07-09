<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            // ContentSeeder::class,
            // AssessmentSeeder::class,
            // PlecsLatestSeeder::class, // restores real data from plecs_latest.sql
            // Bab1PemikiranKomputasionalQuizSeeder::class,
            // Bab2PerwakilanDataQuizSeeder::class,
            // Bab3AlgoritmaQuizSeeder::class,
            // Bab4KodArahanQuizSeeder::class,
            // Ting2Bab1PerwakilanDataQuizSeeder::class,
            // Ting2Bab2AlgoritmaQuizSeeder::class,
            // Ting2Bab3KodArahanQuizSeeder::class,
            // Ting3Bab1PemikiranKomputasionalQuizSeeder::class,
            // Ting3Bab2PerwakilanDataQuizSeeder::class,
            // Ting3Bab3AlgoritmaQuizSeeder::class,
            // Ting3Bab4KodArahanTopicSeeder::class,
            // Ting3Bab4KodArahanQuizSeeder::class,
            // Ting3Bab4KodArahanCodingExerciseSeeder::class,
        ]);
    }
}
