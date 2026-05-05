<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\LearningContent;
use App\Models\LearningContentAttachment;
use App\Models\LearningContentBlock;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContentSeeder extends Seeder
{
    /**
     * Seed content records with customizable hierarchical structure.
     *
    * Structure:
    * - Course
    *   - Topics linked by learning_contents.course_id
     *     - Blocks: text, youtube, pdf, image
     *     - Attachments: pdf, image
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

        $this->seedCourse('Asas Sains Komputer Tingkatan 2', 'Pengenalan lanjutan kepada konsep sains komputer.', [
            [
                'title' => 'Bab 1: Sistem Komputer',
                'description' => 'Memahami komponen dan sistem komputer yang lebih kompleks.',
                'resource_type' => 'none',
                'resource_url' => null,
                'resource_path' => null,
                'blocks' => [
                    [
                        'type' => 'text',
                        'title' => 'Komponen Sistem Komputer',
                        'content' => 'Sistem komputer terdiri dari unit pemprosesan, ingatan, dan peranti masukan/keluaran yang bekerja bersama.',
                        'url' => null,
                        'file_path' => null,
                    ],
                    [
                        'type' => 'youtube',
                        'title' => 'Pengenalan Sistem Komputer',
                        'content' => null,
                        'url' => 'https://www.youtube.com/watch?v=example-sistem',
                        'file_path' => null,
                    ],
                ],
                'attachments' => [
                    [
                        'title' => 'Diagram Sistem Komputer',
                        'type' => 'image',
                        'file_path' => 'images/sistem-komputer.png',
                    ],
                ],
            ],
            [
                'title' => 'Bab 2: Rangkaian dan Komunikasi',
                'description' => 'Asas rangkaian komputer dan komunikasi data.',
                'resource_type' => 'none',
                'resource_url' => null,
                'resource_path' => null,
                'blocks' => [
                    [
                        'type' => 'text',
                        'title' => 'Apa itu Rangkaian?',
                        'content' => 'Rangkaian komputer menghubungkan beberapa komputer untuk berkongsi maklumat dan sumber.',
                        'url' => null,
                        'file_path' => null,
                    ],
                    [
                        'type' => 'youtube',
                        'title' => 'Video Rangkaian Komputer',
                        'content' => null,
                        'url' => 'https://www.youtube.com/watch?v=example-rangkaian',
                        'file_path' => null,
                    ],
                ],
                'attachments' => [
                    [
                        'title' => 'Topologi Rangkaian',
                        'type' => 'image',
                        'file_path' => 'images/topologi-rangkaian.jpg',
                    ],
                    [
                        'title' => 'Catatan Rangkaian',
                        'type' => 'pdf',
                        'file_path' => 'docs/rangkaian-komputer.pdf',
                    ],
                ],
            ],
        ]);
    }

    /**
     * Helper method to seed a course with topics that have blocks and attachments.
     *
     * Usage:
     * $this->seedCourse('Course Title', 'Description', [
     *     [
     *         'title' => 'Topic Title',
     *         'description' => 'Topic Description',
     *         'resource_type' => 'none|youtube|pdf|image',
     *         'resource_url' => 'optional URL',
     *         'resource_path' => 'optional file path',
     *         'blocks' => [
     *             ['type' => 'text|youtube|pdf|image', 'title' => null, 'content' => null, 'url' => null, 'file_path' => null],
     *         ],
     *         'attachments' => [
     *             ['title' => null, 'type' => 'pdf|image', 'file_path' => 'path/file.ext'],
     *         ],
     *     ]
     * ])
     */
    private function seedCourse(string $courseTitle, string $courseDescription, array $topics): void
    {
        $course = Course::query()->create([
            'courseName' => $courseTitle,
            'description' => $courseDescription,
            'content' => null,
            'difficultyLevel' => 'Beginner',
            'isActive' => true,
        ]);

        // Create topics directly under the course with blocks and attachments.
        foreach ($topics as $topicData) {
            $topic = LearningContent::query()->create([
                'title' => $topicData['title'],
                'description' => $topicData['description'] ?? null,
                'content' => $topicData['content'] ?? null,
                'course_id' => $course->courseID,
                'resource_type' => $topicData['resource_type'] ?? 'none',
                'resource_url' => $topicData['resource_url'] ?? null,
                'resource_path' => $topicData['resource_path'] ?? null,
            ]);

            // Seed blocks directly on this topic
            $this->seedBlocks($topic->id, $topicData['blocks'] ?? []);

            // Seed attachments directly on this topic
            $this->seedAttachments($topic->id, $topicData['attachments'] ?? []);
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
