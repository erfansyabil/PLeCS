<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a quiz for "Bab 4: Kod Arahan" under the course "Asas Sains Komputer
 * Tingkatan 1", based on the KSSM Form 1 textbook chapter covering variables,
 * mathematical operators, program development phases, error types, and
 * basic HTML tags for building web pages.
 */
class Bab4KodArahanQuizSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 1')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 1" not found. Skipping Bab 4 quiz seeder.');
            return;
        }

        $topic = Topic::query()
            ->where('courseID', $course->id)
            ->where('name', 'like', '%Kod Arahan%')
            ->first();

        if (!$topic) {
            $this->command?->warn('Topic "Bab 4: Kod Arahan" not found for this course. Skipping Bab 4 quiz seeder.');
            return;
        }

        $questions = $this->questions();

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'topic_id' => $topic->topicID,
                'title' => 'Kuiz Bab 4: Kod Arahan',
            ],
            [
                'description' => 'Kuiz ini menguji kefahaman murid tentang pemboleh ubah, operator matematik, struktur kawalan dalam atur cara, jenis-jenis ralat, pembangunan atur cara, serta asas kod arahan HTML.',
                'difficulty_level' => 'Beginner',
                'points' => array_sum(array_column($questions, 'points')),
                'questions' => $questions,
                'is_published' => true,
                'published_at' => now(),
            ]
        );
    }

    /**
     * @return array<int, array{id: string, question: string, options: array<int, array{id: string, type: string, value: string}>, correct_option_id: string, explanation: string, points: int}>
     */
    private function questions(): array
    {
        return [
            $this->mcq(
                'Apakah maksud pemboleh ubah (variable) dalam pengaturcaraan?',
                [
                    'Simbol yang digunakan untuk operasi matematik',
                    'Storan ingatan yang digunakan oleh program komputer untuk menyimpan data yang perlu diolahkan',
                    'Satu jenis ralat dalam atur cara',
                    'Kod arahan untuk membina laman sesawang',
                ],
                1,
                'Pemboleh ubah ialah storan ingatan yang digunakan oleh program komputer untuk menyimpan data yang perlu diolahkan, seperti nilai berangka, teks atau nilai logik (Boolean).',
                10
            ),
            $this->mcq(
                'Antara berikut, yang manakah BUKAN jenis data yang boleh disimpan dalam pemboleh ubah?',
                [
                    'Nilai berangka (integer atau nombor perpuluhan)',
                    'Teks',
                    'Nilai logik (True/False)',
                    'Tag HTML',
                ],
                3,
                'Pemboleh ubah boleh menyimpan data dalam bentuk nilai berangka, teks atau nilai logik (Boolean seperti True/False). Tag HTML bukan jenis data yang disimpan dalam pemboleh ubah.',
                10
            ),
            $this->mcq(
                'Dalam pengaturcaraan, pengekodan manakah yang digunakan untuk struktur kawalan PELBAGAI PILIHAN?',
                [
                    'IF',
                    'IF...ELSE',
                    'IF...ELSE IF...ELSE',
                    'REPEAT',
                ],
                2,
                'Jadual 4.2 dalam bab ini menunjukkan IF digunakan untuk pilihan tunggal, IF...ELSE untuk dwipilihan, dan IF...ELSE IF...ELSE untuk pelbagai pilihan.',
                10
            ),
            $this->mcq(
                'Dalam perisian Scratch, blok ulangan manakah yang akan berulang TANPA BERHENTI?',
                [
                    'repeat',
                    'repeat until',
                    'forever',
                    'if...else',
                ],
                2,
                'Blok "forever" berulang tanpa berhenti, "repeat" berulang mengikut bilangan lelaran yang ditentukan, dan "repeat until" berulang sehingga syarat dipenuhi.',
                10
            ),
            $this->mcq(
                'Apakah fasa PERTAMA dalam pembangunan atur cara?',
                [
                    'Pengekodan',
                    'Analisis masalah',
                    'Pengujian dan penyahpepijatan',
                    'Dokumentasi',
                ],
                1,
                'Lima fasa utama pembangunan atur cara ialah: analisis masalah, reka bentuk program, pengekodan, pengujian dan penyahpepijatan, serta dokumentasi.',
                10
            ),
            $this->mcq(
                'Ralat yang berlaku semasa pengekodan apabila sintaks atau format pengekodan yang salah digunakan, menyebabkan maklumat tidak dapat dibaca oleh komputer, dikenali sebagai...',
                [
                    'Ralat logik',
                    'Ralat masa larian',
                    'Ralat sintaks',
                    'Ralat dokumentasi',
                ],
                2,
                'Ralat sintaks (juga dikenali sebagai ralat semantik) berlaku semasa proses menulis kod arahan apabila sintaks atau format pengekodan yang salah digunakan.',
                10
            ),
            $this->mcq(
                'Program dapat mengenal dan melaksanakan kod arahan tetapi menghasilkan output yang bukan diingini akibat kesilapan dalam urutan atau tindakan yang ditulis. Ini merupakan contoh...',
                [
                    'Ralat sintaks',
                    'Ralat logik',
                    'Ralat masa larian',
                    'Ralat dokumentasi',
                ],
                1,
                'Ralat logik berlaku semasa menulis kod arahan di mana program dapat mengenal dan melaksanakan kod arahan tetapi menghasilkan output yang bukan diingini, seperti contoh pemandu yang membelok ke arah yang salah.',
                10
            ),
            $this->mcq(
                'Apakah singkatan bagi HTML dan siapakah yang membangunkannya?',
                [
                    'HyperText Markup Language, dibangunkan oleh Tim Berners-Lee',
                    'High Text Master Language, dibangunkan oleh Bill Gates',
                    'HyperText Making Language, dibangunkan oleh Steve Jobs',
                    'Home Text Markup Logic, dibangunkan oleh Mark Zuckerberg',
                ],
                0,
                'HTML ialah singkatan bagi HyperText Markup Language, dibangunkan oleh Tim Berners-Lee pada tahun 1990 untuk membantu pengguna Internet berkomunikasi di World Wide Web (WWW).',
                10
            ),
            $this->mcq(
                'Dalam struktur asas dokumen HTML, di manakah tag <title> dan </title> biasanya diletakkan, dan apakah fungsinya?',
                [
                    'Di antara tag <body> dan </body>; memaparkan kandungan utama laman sesawang',
                    'Di antara tag <head> dan </head>; mengarahkan pelayar web memaparkan teks pada tab laman sesawang',
                    'Di antara tag <html> dan </html> sahaja; tidak mempunyai fungsi khusus',
                    'Selepas tag </html>; memaparkan nota kaki laman sesawang',
                ],
                1,
                'Tag <title> dan </title> biasanya diletakkan di antara tag <head> dan </head>, dan mengarahkan pelayar web untuk memaparkan teks di antaranya pada tab laman sesawang.',
                10
            ),
            $this->mcq(
                'Apakah fungsi tag <p> dan </p> dalam atur cara HTML?',
                [
                    'Menandakan permulaan dan tamat keseluruhan atur cara HTML',
                    'Mengarahkan pelayar web supaya isi kandungan antara dua tag ini dipaparkan sebagai satu perenggan',
                    'Menandakan bahagian kepala laman sesawang',
                    'Memaparkan sepanduk (banner) pada laman sesawang',
                ],
                1,
                'Setiap pasangan tag <p> dan </p> mengarahkan pelayar web supaya isi kandungan antara dua tag ini dipaparkan sebagai satu perenggan (paragraph).',
                10
            ),
        ];
    }

    /**
     * @param  array<int, string>  $optionValues
     */
    private function mcq(string $question, array $optionValues, int $correctIndex, string $explanation, int $points): array
    {
        $options = array_map(
            fn (string $value) => [
                'id' => (string) Str::uuid(),
                'type' => 'text',
                'value' => $value,
            ],
            $optionValues
        );

        return [
            'id' => (string) Str::uuid(),
            'question' => $question,
            'options' => $options,
            'correct_option_id' => $options[$correctIndex]['id'],
            'explanation' => $explanation,
            'points' => $points,
        ];
    }
}
