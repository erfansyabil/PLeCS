<?php

namespace Database\Seeders;

use App\Models\Content;
use App\Models\LearningContentAttachment;
use App\Models\LearningContentBlock;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ContentSeeder extends Seeder
{
    /**
     * Seed content records from the learning_contents table.
     * 
     * Data source: learning_contents.sql dump
     * Contains 5 courses for ASK and SK subjects (Forms 1-5)
     */
    public function run(): void
    {
        // Seed courses from the learning_contents table
        $courses = [
            [
                'id' => 1,
                'title' => 'Asas Sains Komputer Tingkatan 1',
                'description' => "Subjek ini merangkumi 4 bab/topik:\n1. KONSEP ASAS PEMIKIRAN KOMPUTASIONAL\n2. PERWAKILAN DATA\n3. ALGORITMA\n4. KOD ARAHAN",
                'difficulty_level' => 'Beginner',
                'estimated_hours' => 30,
                'keywords' => 'beginner, basic, computational thinking, data, algorithm, code',
            ],
            [
                'id' => 2,
                'title' => 'Asas Sains Komputer Tingkatan 2',
                'description' => "Subjek ini merangkumi 3 bab/topik: \n1. PERWAKILAN DATA \n2. ALGORITMA \n3. KOD ARAHAN",
                'difficulty_level' => 'Beginner',
                'estimated_hours' => 30,
                'keywords' => 'data, algorithm, code',
            ],
            [
                'id' => 3,
                'title' => 'Asas Sains Komputer Tingkatan 3',
                'description' => "Subjek ini merangkumi 4 bab/topik:\n1. KONSEP ASAS PEMIKIRAN KOMPUTASIONAL\n2. PERWAKILAN DATA\n3. ALGORITMA\n4. KOD ARAHAN",
                'difficulty_level' => 'Intermediate',
                'estimated_hours' => 30,
                'keywords' => 'concept, computational, algorithm, code, instructions',
            ],
            [
                'id' => 4,
                'title' => 'Sains Komputer Tingkatan 4',
                'description' => "Subjek ini merangkumi 3 bab/topik:\n1. PENGATURCARAAN\n2. PANGKALAN DATA\n3. INTERAKSI MANUSIA DENGAN KOMPUTER",
                'difficulty_level' => 'Advanced',
                'estimated_hours' => 30,
                'keywords' => 'programming, database, human-computer interaction',
            ],
            [
                'id' => 5,
                'title' => 'Sains Komputer Tingkatan 5',
                'description' => "Subjek ini merangkumi 3 bab/topik:\n1. PENGKOMPUTERAN\n2. PANGKALAN DATA LANJUTAN\n3. PENGATURCARAAN BERASASKAN WEB",
                'difficulty_level' => 'Advanced',
                'estimated_hours' => 40,
                'keywords' => 'computational, database, web development, programming',
            ],
        ];

        $createdCourses = [];
        foreach ($courses as $courseData) {
            $createdCourses[] = $this->seedCourseFromData($courseData);
        }

        // Attach prerequisites: Form 2 requires Form 1, Form 3 requires Form 2, etc.
        for ($i = 1; $i < count($createdCourses); $i++) {
            $current = $createdCourses[$i];
            $prev = $createdCourses[$i - 1];

            if ($current && $prev) {
                // Attach previous form as prerequisite for current form
                $current->prerequisites()->syncWithoutDetaching([$prev->id]);
            }
        }
    }

    /**
     * Seed a single course from the learning_contents data.
     */
    private function seedCourseFromData(array $courseData)
    {
        // Create the course using Content factory or direct creation
        $course = Content::factory()
            ->course()
            ->withTitle($courseData['title'])
            ->withDescription($courseData['description'])
            ->create([
                'difficulty_level' => $courseData['difficulty_level'],
                'estimated_hours' => $courseData['estimated_hours'],
                'keywords' => $courseData['keywords'],
            ]);

        // Maintain a mirrored `courses` row when the `courses` table exists
        if (Schema::hasTable('courses')) {
            DB::table('courses')->updateOrInsert(
                ['courseID' => $course->id],
                [
                    'courseName' => $course->title,
                    'description' => $course->description,
                    'difficultyLevel' => $courseData['difficulty_level'],
                    'estimatedHours' => $courseData['estimated_hours'],
                    'keywords' => $courseData['keywords'],
                    'isActive' => true,
                    'created_at' => $course->created_at ?? now(),
                    'updated_at' => now(),
                ]
            );
        }

        // Parse topics from description and create them
        $topics = $this->parseTopicsFromDescription($courseData['description'], $courseData['title']);
        
        foreach (array_values($topics) as $index => $topicData) {
            $topic = Topic::query()->create([
                'courseID' => $course->id,
                'name' => $topicData['title'],
                'description' => $topicData['description'],
                'prerequisites' => null,
                'difficultyLevel' => $courseData['difficulty_level'],
                'orderIndex' => $index + 1,
                'isActive' => true,
            ]);

            // Create sample blocks for each topic based on the topic content
            $this->seedSampleBlocks($course->id, $topic->topicID, $topicData, $courseData['title']);
        }

        return $course;
    }

    /**
     * Parse topics from the course description text.
     * The description contains numbered topics like "1. TOPIC NAME"
     */
    private function parseTopicsFromDescription(string $description, string $courseTitle): array
    {
        $topics = [];
        
        // Extract numbered topics using regex pattern
        // Matches patterns like "1. TOPIC NAME" or "1. TOPIC NAME\n2. NEXT TOPIC"
        preg_match_all('/(\d+)\.\s+([^\n]+)/', $description, $matches);
        
        if (!empty($matches[2])) {
            foreach ($matches[2] as $index => $topicName) {
                $topicName = trim($topicName);
                $topics[] = [
                    'title' => $topicName,
                    'description' => $this->generateTopicDescription($topicName, $courseTitle),
                ];
            }
        } else {
            // Fallback: Create generic topics if no numbered list found
            $topics[] = [
                'title' => 'Pengenalan',
                'description' => "Pengenalan kepada {$courseTitle}",
            ];
            $topics[] = [
                'title' => 'Konsep Asas',
                'description' => "Konsep asas dalam {$courseTitle}",
            ];
        }
        
        return $topics;
    }

    /**
     * Generate a meaningful description for a topic based on its name.
     */
    private function generateTopicDescription(string $topicName, string $courseTitle): string
    {
        // Clean up the topic name by removing any extra formatting
        $cleanedName = preg_replace('/[^A-Za-z\s]/', '', $topicName);
        $cleanedName = trim($cleanedName);
        
        $descriptions = [
            'PEMIKIRAN KOMPUTASIONAL' => 'Memahami konsep asas pemikiran komputasional termasuk dekomposisi, pengecaman corak, peniskalaan, dan reka bentuk algoritma.',
            'PERWAKILAN DATA' => 'Mempelajari bagaimana data diwakili dalam sistem komputer termasuk nombor, teks, imej, dan audio dalam bentuk binari.',
            'ALGORITMA' => 'Memahami konsep algoritma, pseudokod, carta alir, dan teknik penyelesaian masalah secara berstruktur.',
            'KOD ARAHAN' => 'Pengenalan kepada kod arahan, sintaks asas pengaturcaraan, dan pembangunan atur cara mudah.',
            'PENGATURCARAAN' => 'Mempelajari konsep pengaturcaraan termasuk pembolehubah, struktur kawalan, fungsi, dan pengaturcaraan berorientasikan objek.',
            'PANGKALAN DATA' => 'Memahami konsep pangkalan data, struktur jadual, hubungan, SQL asas, dan pengurusan data.',
            'INTERAKSI MANUSIA DENGAN KOMPUTER' => 'Mempelajari prinsip reka bentuk antara muka pengguna, kebolehgunaan, dan pengalaman pengguna.',
            'PENGKOMPUTERAN' => 'Memahami konsep pengkomputeran termasuk seni bina komputer, sistem operasi, dan rangkaian.',
            'PANGKALAN DATA LANJUTAN' => 'Mempelajari konsep pangkalan data lanjutan termasuk normalisasi, transaksi, pengindeksan, dan pengoptimuman pertanyaan.',
            'PENGATURCARAAN BERASASKAN WEB' => 'Pengenalan kepada pembangunan web termasuk HTML, CSS, JavaScript, dan rangka kerja web.',
        ];
        
        // Find matching description or use default
        foreach ($descriptions as $key => $desc) {
            if (stripos($cleanedName, $key) !== false) {
                return $desc;
            }
        }
        
        // Default description
        return "Mempelajari topik {$topicName} dalam konteks {$courseTitle} termasuk konsep asas, aplikasi praktikal, dan latihan yang berkaitan.";
    }

    /**
     * Seed sample blocks for a topic based on the topic content.
     */
    private function seedSampleBlocks(int $learningContentId, int $topicId, array $topicData, string $courseTitle): void
    {
        $topicName = $topicData['title'];
        
        // Sample blocks that adapt to the topic
        $blocks = [
            [
                'type' => 'text',
                'title' => "Pengenalan kepada {$topicName}",
                'content' => $this->generateBlockContent($topicName, $courseTitle),
                'url' => null,
                'file_path' => null,
            ],
            [
                'type' => 'youtube',
                'title' => "Video Pembelajaran - {$topicName}",
                'content' => null,
                'url' => "https://www.youtube.com/results?search_query=" . urlencode($topicName . " " . $courseTitle),
                'file_path' => null,
            ],
        ];
        
        $this->seedBlocks($learningContentId, $topicId, $blocks);
    }

    /**
     * Generate content for a block based on the topic.
     */
    private function generateBlockContent(string $topicName, string $courseTitle): string
    {
        $cleanedName = preg_replace('/[^A-Za-z\s]/', '', $topicName);
        $cleanedName = trim($cleanedName);
        
        $contentMap = [
            'PEMIKIRAN KOMPUTASIONAL' => '<h2>Konsep Asas Pemikiran Komputasional</h2>
<p><strong>Pemikiran komputasional</strong> adalah pendekatan penyelesaian masalah menggunakan konsep sains komputer. Ia merangkumi:</p>
<ul>
<li><strong>Dekomposisi</strong> - Memecahkan masalah besar kepada bahagian-bahagian kecil</li>
<li><strong>Pengecaman Corak</strong> - Mencari persamaan atau corak dalam masalah</li>
<li><strong>Peniskalaan</strong> - Memfokuskan kepada maklumat penting dan mengabaikan yang tidak relevan</li>
<li><strong>Reka Bentuk Algoritma</strong> - Membangunkan langkah-langkah penyelesaian yang sistematik</li>
</ul>
<p>Kemahiran ini penting dalam menyelesaikan masalah kompleks secara berstruktur.</p>',
            
            'PERWAKILAN DATA' => '<h2>Perwakilan Data dalam Komputer</h2>
<p>Komputer menyimpan dan memproses data dalam bentuk <strong>binari</strong> (0 dan 1). Berikut adalah perwakilan pelbagai jenis data:</p>
<h3>1. Data Nombor</h3>
<ul>
<li>Integer - nombor bulat seperti 0, 1, 2, -5</li>
<li>Nombor Perpuluhan - menggunakan titik perpuluhan (float/double)</li>
</ul>
<h3>2. Data Teks</h3>
<ul>
<li>Setiap aksara diwakili menggunakan kod seperti ASCII atau Unicode</li>
<li>Contoh: Huruf \'A\' = 65 dalam ASCII</li>
</ul>
<h3>3. Data Imej</h3>
<ul>
<li>Imej digital terdiri daripada piksel-piksel kecil</li>
<li>Setiap piksel mempunyai nilai warna (RGB)</li>
</ul>
<h3>4. Data Audio</h3>
<ul>
<li>Gelombang bunyi diubah kepada sampel digital</li>
<li>Kualiti bergantung kepada kadar sampel dan kedalaman bit</li>
</ul>',
            
            'ALGORITMA' => '<h2>Pengenalan kepada Algoritma</h2>
<p><strong>Algoritma</strong> adalah satu set arahan yang tersusun dan sistematik untuk menyelesaikan sesuatu masalah.</p>
<h3>Ciri-ciri Algoritma yang Baik:</h3>
<ul>
<li><strong>Ketepatan</strong> - Menghasilkan output yang betul</li>
<li><strong>Kekangan masa</strong> - Boleh dilaksanakan dalam masa yang munasabah</li>
<li><strong>Kecekapan</strong> - Menggunakan sumber secara optimum</li>
<li><strong>Kebolehbacaan</strong> - Mudah difahami oleh manusia</li>
</ul>
<h3>Cara Mewakili Algoritma:</h3>
<ul>
<li><strong>Pseudokod</strong> - Gabungan bahasa manusia dan kod</li>
<li><strong>Carta Alir (Flowchart)</strong> - Perwakilan grafik menggunakan simbol-simbol tertentu</li>
</ul>
<h3>Contoh Pseudokod:</h3>
<pre>
MULA
    INPUT nombor1, nombor2
    jumlah = nombor1 + nombor2
    OUTPUT jumlah
TAMAT
</pre>',
            
            'KOD ARAHAN' => '<h2>Pengenalan kepada Kod Arahan</h2>
<p><strong>Kod arahan</strong> adalah satu set perintah yang ditulis dalam bahasa pengaturcaraan untuk memberitahu komputer apa yang perlu dilakukan.</p>
<h3>Konsep Asas Pengaturcaraan:</h3>
<ul>
<li><strong>Pembolehubah</strong> - Tempat menyimpan data</li>
<li><strong>Struktur Kawalan</strong> - Mengawal aliran program (if-else, loops)</li>
<li><strong>Fungsi</strong> - Blok kod yang boleh digunakan semula</li>
<li><strong>Input/Output</strong> - Cara program berinteraksi dengan pengguna</li>
</ul>
<h3>Contoh Kod Mudah (Python):</h3>
<pre>
# Program sambutan
nama = input("Masukkan nama anda: ")
print("Selamat datang", nama, "ke kelas Sains Komputer!")
</pre>
<p>Mulakan dengan bahasa pengaturcaraan yang mudah seperti Python atau Scratch untuk memahami konsep asas.</p>',
        ];
        
        // Return matching content or generic content
        foreach ($contentMap as $key => $content) {
            if (stripos($cleanedName, $key) !== false) {
                return $content;
            }
        }
        
        // Generic content for other topics
        return "<h2>Pengenalan kepada {$topicName}</h2>
<p>Topik <strong>{$topicName}</strong> adalah sebahagian daripada kursus <em>{$courseTitle}</em>.</p>
<h3>Objektif Pembelajaran:</h3>
<ul>
<li>Memahami konsep asas {$topicName}</li>
<li>Mengaplikasikan pengetahuan dalam situasi praktikal</li>
<li>Mengenal pasti komponen utama dalam {$topicName}</li>
</ul>
<h3>Aktiviti Pembelajaran:</h3>
<ul>
<li>Membaca nota dan bahan rujukan</li>
<li>Menonton video pembelajaran</li>
<li>Melaksanakan tugasan dan latihan</li>
<li>Mengambil kuiz untuk menguji kefahaman</li>
</ul>";
    }

    /**
     * Create ordered blocks for a topic node.
     */
    private function seedBlocks(int $learningContentId, int $topicId, array $blocks): void
    {
        foreach (array_values($blocks) as $index => $block) {
            LearningContentBlock::query()->create([
                'learning_content_id' => $learningContentId,
                'topic_id' => $topicId,
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
    private function seedAttachments(int $learningContentId, int $topicId, array $attachments): void
    {
        foreach (array_values($attachments) as $index => $attachment) {
            LearningContentAttachment::query()->create([
                'learning_content_id' => $learningContentId,
                'topic_id' => $topicId,
                'title' => $attachment['title'] ?? null,
                'type' => $attachment['type'] ?? 'pdf',
                'file_path' => $attachment['file_path'] ?? '',
                'sort_order' => $index,
            ]);
        }
    }
}