<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a quiz for "Bab 3: Algoritma" under the course "Asas Sains Komputer
 * Tingkatan 1", based on the KSSM Form 1 textbook chapter covering algorithms,
 * pseudocode/flowchart representation, selection and repetition control structures,
 * and error detection techniques.
 */
class Bab3AlgoritmaQuizSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 1')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 1" not found. Skipping Bab 3 quiz seeder.');
            return;
        }

        $topic = Topic::query()
            ->where('courseID', $course->id)
            ->where('name', 'like', '%Algoritma%')
            ->first();

        if (!$topic) {
            $this->command?->warn('Topic "Bab 3: Algoritma" not found for this course. Skipping Bab 3 quiz seeder.');
            return;
        }

        $questions = $this->questions();

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'topic_id' => $topic->topicID,
                'title' => 'Kuiz Bab 3: Algoritma',
            ],
            [
                'description' => 'Kuiz ini menguji kefahaman murid tentang algoritma, pseudokod dan carta alir, struktur kawalan pilihan dan ulangan, serta teknik pengesanan ralat.',
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
                'Apakah maksud algoritma?',
                [
                    'Satu bahasa pengaturcaraan komputer',
                    'Tatacara yang menyatakan tindakan-tindakan dan urutan tindakan untuk menyelesaikan sesuatu masalah',
                    'Satu jenis perisian aplikasi',
                    'Satu simbol grafik dalam carta alir',
                ],
                1,
                'Algoritma ialah tatacara yang menyatakan tindakan-tindakan yang perlu dilaksanakan dan urutan tindakan tersebut bagi menyelesaikan sesuatu masalah.',
                10
            ),
            $this->mcq(
                'Antara berikut, yang manakah dua cara lazim digunakan oleh pengatur cara untuk mewakili algoritma?',
                [
                    'Jadual dan graf',
                    'Carta alir dan pseudokod',
                    'Poster dan peta minda',
                    'Rajah dan graf bar',
                ],
                1,
                'Carta alir (menggunakan simbol grafik) dan pseudokod (menggunakan ayat ringkas dan padat) adalah dua cara lazim yang digunakan pengatur cara untuk mewakili algoritma.',
                10
            ),
            $this->mcq(
                'Struktur kawalan pilihan yang hanya mempunyai SATU pilihan untuk melaksanakan satu set tindakan apabila syarat didapati BENAR dikenali sebagai...',
                [
                    'Pilihan tunggal (single selection)',
                    'Dwipilihan (double selection)',
                    'Pelbagai pilihan (multi selection)',
                    'Struktur kawalan ulangan',
                ],
                0,
                'Struktur kawalan pilihan tunggal hanya mempunyai satu pilihan tindakan yang akan dilaksanakan jika syarat yang diuji didapati BENAR, seperti contoh "palamkan plag ke dalam soket" dalam algoritma menguji lampu.',
                10
            ),
            $this->mcq(
                'Struktur kawalan yang memilih antara DUA tindakan atau set tindakan berbeza berdasarkan sama ada satu syarat dipenuhi atau tidak dikenali sebagai...',
                [
                    'Pilihan tunggal',
                    'Dwipilihan (double selection)',
                    'Struktur kawalan UNTUK',
                    'Struktur kawalan SELAGI',
                ],
                1,
                'Dwipilihan (double selection) memilih antara dua tindakan berlainan: Set Tindakan A dilaksanakan jika syarat benar, dan Set Tindakan B dilaksanakan jika syarat palsu, contohnya mencetak "Lulus" atau "Gagal" berdasarkan markah.',
                10
            ),
            $this->mcq(
                'Apakah maksud simbol pengendali hubungan ">=" dalam pernyataan syarat seperti "Markah >= 40"?',
                [
                    'Lebih kecil daripada',
                    'Sama dengan',
                    'Lebih besar atau sama dengan',
                    'Lebih kecil atau sama dengan',
                ],
                2,
                'Simbol ">=" ialah pengendali hubungan yang bermaksud "lebih besar atau sama dengan". Pernyataan "Markah >= 40" bermaksud markah lebih besar atau sama dengan 40.',
                10
            ),
            $this->mcq(
                'Struktur kawalan ulangan manakah yang melaksanakan satu langkah atau set langkah berdasarkan bilangan pembilangan yang telah ditetapkan?',
                [
                    'UNTUK (FOR)',
                    'SELAGI (WHILE)',
                    'ULANG-SEHINGGA (REPEAT-UNTIL)',
                    'Dwipilihan',
                ],
                0,
                'Struktur kawalan UNTUK (FOR) melaksanakan satu set langkah berdasarkan bilangan pembilangan yang telah ditetapkan, contohnya melaungkan "Merdeka" sebanyak tiga kali menggunakan pembilang dari 1 hingga 3.',
                10
            ),
            $this->mcq(
                'Apakah perbezaan utama antara struktur kawalan SELAGI (WHILE) dan ULANG-SEHINGGA (REPEAT-UNTIL)?',
                [
                    'SELAGI menguji syarat sebelum langkah dilaksanakan, manakala ULANG-SEHINGGA menguji syarat selepas langkah dilaksanakan sekurang-kurangnya sekali',
                    'SELAGI hanya boleh digunakan sekali, manakala ULANG-SEHINGGA boleh digunakan berkali-kali',
                    'SELAGI menggunakan carta alir sahaja, manakala ULANG-SEHINGGA menggunakan pseudokod sahaja',
                    'Tiada perbezaan antara kedua-dua struktur kawalan ini',
                ],
                0,
                'Dalam SELAGI, syarat diuji terlebih dahulu sebelum langkah-langkah gelung dilaksanakan (mungkin tidak dilaksanakan langsung). Dalam ULANG-SEHINGGA, syarat diuji selepas langkah-langkah dilaksanakan, jadi langkah tersebut sekurang-kurangnya dilaksanakan sekali.',
                10
            ),
            $this->mcq(
                'Ralat yang menyebabkan sesuatu algoritma tidak menghasilkan output yang diingini akibat kesilapan manusia semasa pembangunan algoritma, seperti urutan langkah yang tidak betul, dikenali sebagai...',
                [
                    'Ralat sintaks',
                    'Ralat logik',
                    'Ralat kompilasi',
                    'Ralat perkakasan',
                ],
                1,
                'Ralat logik ialah jenis ralat yang biasa dijumpai dalam algoritma, menyebabkan output yang salah akibat tindakan atau urutan langkah yang salah semasa pembangunan algoritma.',
                10
            ),
            $this->mcq(
                'Teknik pengesanan ralat yang menggunakan satu sampel data input dan memproses data itu secara manual (dengan pen dan kertas) mengikut langkah-langkah algoritma, kemudian membandingkan output yang diperoleh dengan output yang dijangka, dikenali sebagai...',
                [
                    'Teknik langkah demi langkah (step through)',
                    'Teknik semakan meja (desk check)',
                    'Teknik carta alir',
                    'Teknik pseudokod',
                ],
                1,
                'Teknik semakan meja (desk check) menggunakan sampel data input dan diproses secara manual mengikut langkah algoritma untuk membandingkan output yang diperoleh dengan output yang dijangka.',
                10
            ),
            $this->mcq(
                'Apakah langkah PERTAMA dalam proses menghasilkan pseudokod dan carta alir bagi sesuatu algoritma?',
                [
                    'Menulis pseudokod dan melukis carta alir',
                    'Mereka bentuk algoritma',
                    'Mengenal pasti masalah',
                    'Menentukan output yang diingini',
                ],
                2,
                'Susunan langkah menghasilkan pseudokod dan carta alir ialah: mengenal pasti masalah -> menentukan data yang perlu digunakan -> menentukan proses/tugas -> menentukan output -> mereka bentuk algoritma -> menulis pseudokod dan melukis carta alir.',
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
