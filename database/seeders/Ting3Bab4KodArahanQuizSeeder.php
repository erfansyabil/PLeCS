<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a quiz for "Bab 4: Kod Arahan" under the course "Asas Sains Komputer
 * Tingkatan 3", based on the KSSM Form 3 textbook chapter covering databases,
 * entities/attributes, primary/foreign keys, cardinality, SQL statements, and
 * function vs procedure in program structure.
 *
 * Requires Ting3Bab4KodArahanTopicSeeder to have run first, since this topic
 * did not previously exist in the topics table.
 */
class Ting3Bab4KodArahanQuizSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 3')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 3" not found. Skipping Ting 3 Bab 4 quiz seeder.');
            return;
        }

        $topic = Topic::query()
            ->where('courseID', $course->id)
            ->where('name', 'like', '%Kod Arahan%')
            ->first();

        if (!$topic) {
            $this->command?->warn('Topic "Bab 4: Kod Arahan" not found for this course. Run Ting3Bab4KodArahanTopicSeeder first. Skipping Ting 3 Bab 4 quiz seeder.');
            return;
        }

        $questions = $this->questions();

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'topic_id' => $topic->topicID,
                'title' => 'Kuiz Bab 4: Kod Arahan (Tingkatan 3)',
            ],
            [
                'description' => 'Kuiz ini menguji kefahaman murid tentang pangkalan data, entiti dan atribut, kekunci primer dan asing, kekardinalan, pernyataan SQL, serta function dan procedure dalam struktur kod arahan.',
                'difficulty_level' => 'Intermediate',
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
                'Apakah maksud pangkalan data (database)?',
                [
                    'Satu bahasa pengaturcaraan untuk membina laman sesawang',
                    'Tempat pengumpulan dan penyimpanan data secara berpusat bagi sistem maklumat yang berasaskan komputer',
                    'Satu kaedah untuk menyulitkan data',
                    'Satu jenis ralat dalam atur cara',
                ],
                1,
                'Pangkalan data ialah tempat pengumpulan dan penyimpanan data secara berpusat, iaitu koleksi data yang saling berhubung dan disimpan tanpa pengulangan data yang tidak dikehendaki.',
                10
            ),
            $this->mcq(
                'Apakah singkatan bagi SQL, dan apakah kegunaan utamanya?',
                [
                    'Structured Query Language — digunakan untuk menyimpan, memanipulasi dan mendapatkan data daripada pangkalan data',
                    'System Quality Language — digunakan untuk menguji kualiti sistem komputer',
                    'Simple Query Logic — digunakan untuk mengesan ralat logik dalam atur cara',
                    'Structured Question List — digunakan untuk menyediakan soalan kuiz',
                ],
                0,
                'SQL (Structured Query Language) ialah bahasa pengaturcaraan aras tinggi yang digunakan untuk menyimpan, memanipulasi dan mendapatkan data daripada pangkalan data.',
                10
            ),
            $this->mcq(
                'Dalam pangkalan data, entiti seperti MURID diwakili oleh apa, manakala atribut seperti Nama dan Kelas diwakili oleh apa?',
                [
                    'Entiti diwakili oleh simbol segi empat; atribut diwakili oleh bentuk bulatan bujur',
                    'Entiti diwakili oleh bulatan bujur; atribut diwakili oleh segi empat',
                    'Entiti dan atribut kedua-duanya diwakili oleh segi empat',
                    'Entiti diwakili oleh rombus; atribut diwakili oleh segi tiga',
                ],
                0,
                'Dalam gambar rajah perhubungan entiti, entiti diwakili oleh simbol segi empat, manakala atribut (yang menerangkan ciri-ciri entiti) diwakili oleh bentuk bulatan bujur.',
                10
            ),
            $this->mcq(
                'Apakah ciri UTAMA bagi kekunci primer (primary key) dalam satu jadual pangkalan data?',
                [
                    'Boleh menerima beberapa nilai kosong (null) dan boleh berulang',
                    'Mempunyai nilai unik, tidak boleh mengandungi data berulang atau kosong (null), dan digunakan untuk mengenal pasti rekod',
                    'Mesti sentiasa berada pada lajur terakhir sebelah kanan jadual',
                    'Hanya boleh digunakan dalam pernyataan SELECT sahaja',
                ],
                1,
                'Kekunci primer ialah atribut dengan nilai unik yang tidak boleh mengandungi data berulang atau kosong (null), digunakan untuk mengenal pasti setiap rekod dalam jadual. Setiap entiti mempunyai sekurang-kurangnya satu kekunci primer.',
                10
            ),
            $this->mcq(
                'Apakah fungsi kekunci asing (foreign key) dalam pangkalan data hubungan?',
                [
                    'Mengaitkan dua atau lebih entiti yang mempunyai hubungan, dengan menjadi kekunci primer bagi jadual hubungan yang lain',
                    'Menyulitkan data supaya tidak dapat dibaca oleh pihak lain',
                    'Menetapkan bilangan lajur dalam jadual Columnar Transposition',
                    'Menggantikan kekunci primer apabila ia hilang',
                ],
                0,
                'Kekunci asing ialah atribut dalam satu jadual hubungan yang merupakan kekunci primer bagi satu jadual hubungan yang lain, digunakan untuk mengaitkan rekod-rekod dari dua atau lebih jadual yang mempunyai hubungan.',
                10
            ),
            $this->mcq(
                'Kekardinalan one to one (1:1) antara dua entiti bermaksud...',
                [
                    'Satu entiti berhubung dengan banyak entiti yang lain',
                    'Satu entiti berhubung dengan hanya satu entiti yang lain dan sebaliknya',
                    'Kedua-dua entiti tidak mempunyai sebarang hubungan',
                    'Entiti-entiti dihubungkan menggunakan kekunci asing sahaja tanpa kekunci primer',
                ],
                1,
                'Kekardinalan one to one (1:1) bermaksud satu entiti berhubung dengan hanya satu entiti yang lain dan sebaliknya, contohnya seorang pengetua menguruskan sebuah sekolah dan sebuah sekolah hanya mempunyai seorang pengetua.',
                10
            ),
            $this->mcq(
                'Pernyataan SQL manakah yang digunakan untuk mencapai data yang memenuhi sesuatu kriteria tertentu sahaja daripada satu jadual?',
                [
                    'SELECT...FROM',
                    'SELECT...WHERE',
                    'SELECT...ORDER BY',
                    'SELECT * FROM',
                ],
                1,
                'Pernyataan SELECT...WHERE mencapai data-data yang tertentu yang memenuhi sesuatu kriteria sahaja (dinyatakan dalam klausa WHERE), berbeza dengan SELECT...FROM yang memaparkan kesemua rekod.',
                10
            ),
            $this->mcq(
                'Dalam pernyataan SQL "SELECT Nama_Murid FROM MURID ORDER BY Nama_Murid DESC;", apakah kesan penggunaan DESC?',
                [
                    'Data akan diisih mengikut susunan menaik (A hingga Z)',
                    'Data akan diisih mengikut susunan menurun (Z hingga A)',
                    'Data akan dipadamkan daripada jadual',
                    'Hanya satu rekod sahaja akan dipaparkan',
                ],
                1,
                'DESC (descending) dalam pernyataan SELECT...ORDER BY akan mengisih data mengikut susunan menurun. Sebaliknya, ASC (ascending) mengisih data mengikut susunan menaik.',
                10
            ),
            $this->mcq(
                'Apakah perbezaan UTAMA antara function dan procedure dalam pengaturcaraan?',
                [
                    'Function memulangkan satu atau beberapa nilai selepas tugas diselesaikan, manakala procedure tidak memulangkan sebarang nilai',
                    'Procedure sentiasa lebih pantas berbanding function',
                    'Function hanya boleh digunakan sekali sahaja, manakala procedure boleh digunakan berulang kali',
                    'Function tidak memerlukan sebarang parameter, manakala procedure sentiasa memerlukan parameter',
                ],
                0,
                'Function sesuai digunakan bagi subtugas yang perlu memulangkan satu nilai selepas tugas diselesaikan, manakala procedure sesuai digunakan bagi tugas yang perlu dilaksanakan berulang kali tanpa pemulangan nilai.',
                10
            ),
            $this->mcq(
                'Apakah perbezaan antara built-in function (fungsi dalaman) dan user-defined function (fungsi dihasilkan sendiri)?',
                [
                    'Built-in function sudah sedia ada dan disimpan dalam library bahasa pengaturcaraan, manakala user-defined function ditulis sendiri oleh pengatur cara',
                    'Built-in function hanya boleh digunakan dalam Python, manakala user-defined function boleh digunakan dalam semua bahasa',
                    'Built-in function memerlukan parameter, manakala user-defined function tidak memerlukan parameter',
                    'Tiada perbezaan antara kedua-duanya',
                ],
                0,
                'Built-in function ialah fungsi yang sedia ada dan disimpan dalam library bahasa pengaturcaraan (contohnya input() dan print() dalam Python), manakala user-defined function ditulis sendiri oleh pengatur cara untuk tugas yang khusus.',
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
