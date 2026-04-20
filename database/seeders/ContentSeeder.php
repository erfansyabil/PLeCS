<?php

namespace Database\Seeders;

use App\Models\Content;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContentSeeder extends Seeder
{
    /**
     * Seed content records with required foreign-key dependencies.
     */
    public function run(): void
    {
        $courseId = DB::table('courses')->insertGetId([
            'courseName' => 'Introduction to Programming',
            'description' => 'Foundational programming concepts and problem solving.',
            'difficultyLevel' => 'Beginner',
            'isActive' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ], 'courseID');

        $topicIds = [];
        for ($i = 1; $i <= 5; $i++) {
            $topicIds[] = DB::table('topics')->insertGetId([
                'courseID' => $courseId,
                'name' => 'Topic '.$i,
                'description' => fake()->sentence(10),
                'prerequisites' => $i > 1 ? (string) $topicIds[$i - 2] : null,
                'difficultyLevel' => fake()->randomElement(['Beginner', 'Intermediate', 'Advanced']),
                'orderIndex' => $i,
                'isActive' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ], 'topicID');
        }

        $uploaderIds = User::query()
            ->whereIn('role', [User::ROLE_TEACHER, User::ROLE_ADMINISTRATOR])
            ->pluck('id')
            ->all();

        if (empty($uploaderIds)) {
            return;
        }

        $formats = ['Video', 'PDF', 'Article', 'Image'];

        for ($i = 1; $i <= 20; $i++) {
            $format = fake()->randomElement($formats);
            $slug = fake()->slug();

            Content::query()->create([
                'topicID' => fake()->randomElement($topicIds),
                'uploadedBy' => fake()->randomElement($uploaderIds),
                'title' => fake()->sentence(5),
                'format' => $format,
                'filePath' => match ($format) {
                    'Video' => 'https://cdn.example.com/videos/'.$slug.'.mp4',
                    'PDF' => 'https://cdn.example.com/docs/'.$slug.'.pdf',
                    'Article' => 'https://example.com/articles/'.$slug,
                    default => 'https://cdn.example.com/images/'.$slug.'.jpg',
                },
                'sizeMB' => fake()->randomFloat(2, 0.10, 200.00),
                'isLowBandwidth' => fake()->boolean(25),
                'isSupplementary' => fake()->boolean(40),
            ]);
        }
    }
}
