<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a quiz for "Bab 2: Algoritma" under the course "Asas Sains Komputer
 * Tingkatan 2", based on the KSSM Form 2 textbook chapter covering nested selection
 * control structures, for/while repetition control structures, and error detection
 * (syntax, runtime, and logic errors) using the desk-check technique.
 */
class Ting2Bab2AlgoritmaQuizSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 2')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 2" not found. Skipping Ting 2 Bab 2 quiz seeder.');
            return;
        }

        $topic = Topic::query()
            ->where('courseID', $course->id)
            ->where('name', 'like', '%Algoritma%')
            ->first();

        if (!$topic) {
            $this->command?->warn('Topic "Bab 2: Algoritma" not found for this course. Skipping Ting 2 Bab 2 quiz seeder.');
            return;
        }

        $questions = $this->questions();

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'topic_id' => $topic->topicID,
                'title' => 'Kuiz Bab 2: Algoritma (Tingkatan 2)',
            ],
            [
                'description' => 'Kuiz ini menguji kefahaman murid tentang struktur kawalan pilihan bersarang, struktur kawalan ulangan (for dan while), jenis-jenis ralat, serta teknik semakan meja untuk mengesan ralat logik.',
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
                'Apakah maksud struktur kawalan pilihan bersarang (nested selection)?',
                [
                    'Satu struktur kawalan yang terbenam dalam satu struktur kawalan yang lain',
                    'Satu struktur kawalan yang berulang tanpa henti',
                    'Satu struktur kawalan yang hanya mempunyai satu pilihan tindakan',
                    'Satu struktur kawalan yang tidak memerlukan sebarang syarat',
                ],
                0,
                'Struktur kawalan pilihan bersarang terdiri daripada satu struktur kawalan yang terbenam dalam satu struktur kawalan yang lain, di mana struktur kawalan kedua hanya bermula selepas struktur kawalan pertama dipenuhi.',
                10
            ),
            $this->mcq(
                'Dalam algoritma mencari kek lapis Sarawak (Rajah 2.3 dan 2.4), berapakah bilangan keputusan (struktur kawalan dwipilihan) yang terlibat dalam struktur kawalan pilihan bersarang tersebut?',
                [
                    'Satu keputusan',
                    'Dua keputusan',
                    'Tiga keputusan',
                    'Empat keputusan',
                ],
                1,
                'Algoritma tersebut mempunyai dua keputusan: (1) Ada kek lapis Sarawak? dan (2) Corak kek lapis Sarawak menarik? — kedua-duanya ialah struktur kawalan dwipilihan yang bersarang.',
                10
            ),
            $this->mcq(
                'Apakah ciri utama struktur kawalan ulangan FOR berbanding struktur kawalan ulangan WHILE?',
                [
                    'FOR digunakan apabila bilangan ulangan telah ditetapkan (dikawal oleh pembilang)',
                    'FOR tidak memerlukan sebarang syarat untuk berulang',
                    'FOR hanya boleh digunakan sekali sahaja dalam satu atur cara',
                    'FOR sentiasa berulang tanpa berhenti',
                ],
                0,
                'Struktur kawalan ulangan FOR melakukan ulangan bagi bilangan kali yang tertentu, dikawal oleh suatu pembilang yang berubah pada setiap ulangan. Ini berbeza dengan WHILE, di mana bilangan ulangan tidak diketahui dan bergantung kepada sama ada syarat dipenuhi.',
                10
            ),
            $this->mcq(
                'Dalam struktur kawalan ulangan WHILE, bilakah pernyataan syarat diuji?',
                [
                    'Selepas pernyataan yang berulang dilaksanakan',
                    'Sebelum pernyataan yang berulang dilaksanakan, dan ulangan diteruskan selagi syarat adalah benar',
                    'Hanya sekali di permulaan atur cara',
                    'Tidak perlu diuji langsung',
                ],
                1,
                'Dalam struktur kawalan ulangan WHILE, syarat diuji terlebih dahulu sebelum pernyataan yang berulang dilaksanakan. Ulangan diteruskan selagi syarat yang diuji adalah benar.',
                10
            ),
            $this->mcq(
                'Ralat yang menyebabkan atur cara terhenti secara tiba-tiba tanpa diduga semasa jalanan ujian, selalunya disebabkan oleh memori tidak mencukupi atau perisian hasad, dikenali sebagai...',
                [
                    'Ralat sintaks',
                    'Ralat masa larian',
                    'Ralat logik',
                    'Ralat semakan meja',
                ],
                1,
                'Ralat masa larian (runtime error) merujuk kepada kesilapan yang menyebabkan atur cara terhenti secara tiba-tiba tanpa diduga, boleh disebabkan oleh perkakasan seperti memori tidak mencukupi, virus komputer, atau perisian hasad.',
                10
            ),
            $this->mcq(
                'Apakah ciri khusus bagi ralat logik berbanding ralat sintaks dan ralat masa larian?',
                [
                    'Ralat logik memaparkan mesej ralat yang jelas semasa pelaksanaan',
                    'Ralat logik menyebabkan atur cara terhenti serta-merta',
                    'Ralat logik menghasilkan output yang tidak diingini tanpa sebarang paparan mesej ralat, dan sukar dikesan',
                    'Ralat logik hanya berlaku dalam bahasa pengaturcaraan Python',
                ],
                2,
                'Ralat logik menyebabkan output yang tidak dijangka akibat kesilapan semasa pembangunan algoritma (seperti syarat yang ditulis salah), dan sukar dikesan kerana tiada paparan mesej ralat, berbeza dengan ralat sintaks atau ralat masa larian.',
                10
            ),
            $this->mcq(
                'Dalam Contoh 2.5 dan 2.6, Murni mendapati ulangan while dengan syarat "k <= 50" menghasilkan output yang melebihi jangkaan (sehingga 50 dan bukan berhenti pada 45). Apakah pembetulan yang perlu dibuat?',
                [
                    'Menukar syarat ulangan kepada "k <= 45"',
                    'Menukar pemboleh ubah k kepada pemalar',
                    'Menambah satu lagi struktur kawalan pilihan',
                    'Menukar struktur kawalan ulangan while kepada for',
                ],
                0,
                'Ralat logik disebabkan syarat ulangan (k <= 50) yang tidak tepat. Syarat ulangan perlu dibetulkan kepada (k <= 45) supaya senarai nombor berhenti pada nombor 45 seperti yang dikehendaki.',
                10
            ),
            $this->mcq(
                'Apakah dua teknik manual yang digunakan oleh pengatur cara untuk mengesan ralat logik dalam pseudokod atau carta alir?',
                [
                    'Teknik pengekodan dan teknik penyahpepijatan',
                    'Teknik semakan meja (desk check) dan teknik langkah demi langkah (step through)',
                    'Teknik pengujian unit dan teknik integrasi',
                    'Teknik input dan teknik output',
                ],
                1,
                'Dua teknik manual yang digunakan untuk mengesan ralat logik ialah teknik semakan meja (desk check) dan teknik langkah demi langkah (step through), kedua-duanya dijalankan menggunakan kertas dan pensel sahaja.',
                10
            ),
            $this->mcq(
                'Apakah maksud algoritma?',
                [
                    'Satu bahasa pengaturcaraan yang khusus',
                    'Satu siri prosedur langkah demi langkah yang tersusun untuk menghasilkan output yang diperlukan bagi menyelesaikan sesuatu masalah',
                    'Satu jenis ralat dalam atur cara',
                    'Satu simbol grafik dalam carta alir',
                ],
                1,
                'Algoritma ialah satu siri langkah untuk menyelesaikan sesuatu masalah atau melengkapkan sesuatu tugas, terdiri daripada satu siri prosedur langkah demi langkah yang tersusun untuk menghasilkan output yang diperlukan.',
                10
            ),
            $this->mcq(
                'Bagi masalah yang kompleks yang menggabungkan struktur kawalan pilihan bersarang dan struktur kawalan ulangan (seperti algoritma membuat capati), apakah langkah PERTAMA yang perlu dilakukan?',
                [
                    'Menulis pseudokod',
                    'Melukis carta alir',
                    'Penyiasatan (mengenal pasti input, proses dan output)',
                    'Menguji atur cara',
                ],
                2,
                'Langkah pertama dalam menghasilkan algoritma bagi masalah kompleks ialah penyiasatan — mengenal pasti input yang diperlukan, proses-proses yang terlibat, dan output yang dihasilkan — sebelum mendraf dan memurnikan algoritma.',
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
