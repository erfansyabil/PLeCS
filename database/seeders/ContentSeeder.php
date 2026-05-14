<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\LearningContent;
use App\Models\LearningContentAttachment;
use App\Models\LearningContentBlock;
use Illuminate\Database\Seeder;

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
        // Add or edit courses here.
        $this->seedCourse('Asas Sains Komputer Tingkatan 1', 'Pengenalan kepada konsep asas sains komputer.', [
            [
                'title' => 'Bab 1: Konsep Asas Sains Komputer',
                'description' => 'Pengenalan kepada komputer, data, dan sistem maklumat.',
                'resource_type' => 'none',
                'resource_url' => null,
                'resource_path' => null,
                'blocks' => [
                    [
                        'type' => 'text',
                        'title' => 'Apa itu Sains Komputer?',
                        'content' => 'Sains komputer ialah bidang yang mengkaji pengiraan, algoritma, data, dan sistem komputer.',
                        'url' => null,
                        'file_path' => null,
                    ],
                    [
                        'type' => 'youtube',
                        'title' => 'Video Pengenalan',
                        'content' => null,
                        'url' => 'https://www.youtube.com/watch?v=wccpYAEHBJY   ',
                        'file_path' => null,
                    ],
                ],
                'attachments' => [
                    [
                        'title' => 'Nota Ringkas PDF',
                        'type' => 'pdf',
                        'file_path' => 'docs/asas-sains-komputer.pdf',
                    ],
                    [
                        'title' => 'Rajah Konsep',
                        'type' => 'image',
                        'file_path' => 'images/asas-sains-komputer.png',
                    ],
                ],
            ],
            [
                'title' => 'Bab 2: Perwakilan Data',
                'description' => 'Bagaimana data diwakili dan disimpan dalam komputer.',
                'resource_type' => 'none',
                'resource_url' => null,
                'resource_path' => null,
                'blocks' => [
                    [
                        'type' => 'text',
                        'title' => 'Penerangan Data',
                        'content' => 'Komputer menyimpan data dalam bentuk binari seperti nombor, teks, imej, dan bunyi.',
                        'url' => null,
                        'file_path' => null,
                    ],
                ],
                'attachments' => [
                    [
                        'title' => 'Carta Perwakilan Data',
                        'type' => 'image',
                        'file_path' => 'images/perwakilan-data.jpg',
                    ],
                ],
            ],
        ], 'Beginner');

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
        ], 'Intermediate');
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
    private function seedCourse(string $courseTitle, string $courseDescription, array $topics, string $difficulty = 'Beginner'): void
    {
        $course = LearningContent::query()->updateOrCreate(
            [
                'type' => 'course',
                'title' => $courseTitle,
            ],
            [
                'description' => $courseDescription,
                'content' => null,
                'parent_id' => null,
                'resource_type' => 'none',
                'resource_url' => null,
                'resource_path' => null,
                'difficulty_level' => $difficulty,
            ]
        );

        Course::query()->updateOrCreate(
            ['courseID' => $course->id],
            [
                'courseName' => $course->title,
                'description' => $course->description,
                'difficultyLevel' => $difficulty,
                'isActive' => true,
            ]
        );

        $legacyCourse = Course::query()->findOrFail($course->id);
        $legacyCourse->topics()->delete();

        foreach (array_values($topics) as $index => $topicData) {
            $topic = Topic::query()->create([
                'courseID' => $course->id,
                'name' => $topicData['title'],
                'description' => $topicData['description'],
                'prerequisites' => null,
                'difficultyLevel' => $difficulty,
                'orderIndex' => $index + 1,
                'isActive' => true,
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
