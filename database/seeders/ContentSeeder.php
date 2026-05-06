<?php

namespace Database\Seeders;

use App\Models\Content;
use App\Models\LearningContentAttachment;
use App\Models\LearningContentBlock;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    /**
     * Seed content records with customizable hierarchical structure.
     *
     * Structure:
     * - Subject/Course (type: 'course')
     *   - Topics (type: 'topic', parent_id: course.id)
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
                        'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
        ]);

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
        // Create the course
        $course = Content::factory()
            ->course()
            ->withTitle($courseTitle)
            ->withDescription($courseDescription)
            ->create();

        // Create topics directly under the course with blocks and attachments.
        foreach ($topics as $topicData) {
            $topic = Content::factory()
                ->topic($course->id)
                ->state([
                    'resource_type' => $topicData['resource_type'] ?? 'none',
                    'resource_url' => $topicData['resource_url'] ?? null,
                    'resource_path' => $topicData['resource_path'] ?? null,
                ])
                ->withTitle($topicData['title'])
                ->withDescription($topicData['description'])
                ->create();

            // Seed blocks directly on this topic
            $this->seedBlocks($topic->id, $topicData['blocks'] ?? []);

            // Seed attachments directly on this topic
            $this->seedAttachments($topic->id, $topicData['attachments'] ?? []);
        }
    }

    /**
     * Create ordered blocks for a topic node.
     */
    private function seedBlocks(int $topicId, array $blocks): void
    {
        foreach (array_values($blocks) as $index => $block) {
            LearningContentBlock::query()->create([
                'learning_content_id' => $topicId,
                'type' => $block['type'] ?? 'text',
                'title' => $block['title'] ?? null,
                'content' => $block['content'] ?? null,
                'url' => $block['url'] ?? null,
                'file_path' => $block['file_path'] ?? null,
                'sort_order' => $index,
            ]);
        }
    }

    /**
     * Create ordered attachments for a topic node.
     */
    private function seedAttachments(int $topicId, array $attachments): void
    {
        foreach (array_values($attachments) as $index => $attachment) {
            LearningContentAttachment::query()->create([
                'learning_content_id' => $topicId,
                'title' => $attachment['title'] ?? null,
                'type' => $attachment['type'] ?? 'pdf',
                'file_path' => $attachment['file_path'] ?? '',
                'sort_order' => $index,
            ]);
        }
    }
}
