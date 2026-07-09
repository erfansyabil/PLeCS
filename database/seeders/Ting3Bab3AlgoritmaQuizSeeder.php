<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a quiz for "Bab 3: Algoritma" under the course "Asas Sains Komputer
 * Tingkatan 3", based on the KSSM Form 3 textbook chapter covering search
 * algorithms (linear search, binary search) and sort algorithms (bubble sort,
 * bucket sort).
 */
class Ting3Bab3AlgoritmaQuizSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 3')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 3" not found. Skipping Ting 3 Bab 3 quiz seeder.');
            return;
        }

        $topic = Topic::query()
            ->where('courseID', $course->id)
            ->where('name', 'like', '%Algoritma%')
            ->first();

        if (!$topic) {
            $this->command?->warn('Topic "Bab 3: Algoritma" not found for this course. Skipping Ting 3 Bab 3 quiz seeder.');
            return;
        }

        $questions = $this->questions();

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'topic_id' => $topic->topicID,
                'title' => 'Kuiz Bab 3: Algoritma (Tingkatan 3)',
            ],
            [
                'description' => 'Kuiz ini menguji kefahaman murid tentang ciri-ciri algoritma search (linear search, binary search) dan sort (bubble sort, bucket sort).',
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
                'Apakah maksud "search" dalam bidang pengkomputeran?',
                [
                    'Proses mengisih atau menyusun item-item dalam satu senarai',
                    'Proses untuk mendapatkan suatu item tertentu yang terkandung dalam satu senarai',
                    'Proses menyulitkan data supaya tidak dapat dibaca oleh pihak lain',
                    'Proses menyimpan data dalam pangkalan data',
                ],
                1,
                'Search ialah proses untuk mendapatkan suatu item tertentu yang terkandung dalam satu senarai, penting untuk membantu mendapatkan maklumat yang dikehendaki dengan lebih cepat.',
                10
            ),
            $this->mcq(
                'Bagaimanakah cara linear search mencari item yang dikehendaki dalam satu senarai?',
                [
                    'Bermula dengan item pertama dan menyemak setiap item secara berturutan sehingga item yang dikehendaki diperoleh',
                    'Membahagikan senarai kepada dua bahagian dan menyemak titik pertengahan',
                    'Mengisih senarai terlebih dahulu sebelum melakukan carian',
                    'Menyemak hanya item terakhir dalam senarai',
                ],
                0,
                'Linear search bermula dengan item pertama dalam senarai. Jika bukan item yang dikehendaki, carian diteruskan ke item kedua, ketiga, dan seterusnya sehingga item yang dikehendaki diperoleh atau carian tamat tanpa hasil.',
                10
            ),
            $this->mcq(
                'Apakah syarat PENTING yang perlu dipenuhi sebelum binary search dapat dilakukan ke atas satu senarai?',
                [
                    'Senarai mesti mengandungi nombor sahaja, bukan teks',
                    'Item-item dalam senarai perlu diisih dalam urutan menaik terlebih dahulu',
                    'Senarai mesti mengandungi kurang daripada 10 item',
                    'Senarai perlu disulitkan terlebih dahulu',
                ],
                1,
                'Sebelum binary search dapat dilakukan, item-item dalam senarai perlu diisih dalam urutan menaik terlebih dahulu. Ini membolehkan teknik dwipilihan (bandingkan dengan item tengah) berfungsi dengan betul.',
                10
            ),
            $this->mcq(
                'Diberi satu senarai 9 item dengan indeks 0 hingga 8, apakah formula untuk mendapatkan indeks item pertengahan dalam binary search?',
                [
                    '(Indeks terkecil + Indeks terbesar) / 2',
                    'Indeks terbesar - Indeks terkecil',
                    'Bilangan item dalam senarai / 2',
                    'Indeks terkecil x Indeks terbesar',
                ],
                0,
                'Formula untuk mendapatkan indeks item pertengahan dalam binary search ialah (Indeks terkecil + Indeks terbesar) / 2. Contohnya, bagi senarai dengan indeks 0 hingga 8, item pertengahan berada pada indeks (0+8)/2 = 4.',
                10
            ),
            $this->mcq(
                'Mengapakah binary search dikatakan lebih efisien berbanding linear search bagi senarai dengan item yang banyak?',
                [
                    'Binary search tidak memerlukan sebarang perbandingan',
                    'Binary search tidak perlu menyemak setiap item dalam senarai kerana ia menggunakan keputusan dwipilihan untuk mengurangkan separuh senarai pada setiap langkah',
                    'Binary search hanya boleh digunakan pada senarai kecil sahaja',
                    'Binary search menggunakan lebih banyak ingatan komputer',
                ],
                1,
                'Binary search lebih efisien kerana ia tidak perlu menyemak setiap item dalam senarai. Sebaliknya, ia menggunakan keputusan dwipilihan untuk mengabaikan separuh senarai pada setiap langkah perbandingan.',
                10
            ),
            $this->mcq(
                'Apakah maksud "sort" dalam bidang pengkomputeran?',
                [
                    'Proses untuk mendapatkan suatu item tertentu dalam senarai',
                    'Proses mengisih atau menyusun item-item dalam suatu senarai linear mengikut urutan tertentu',
                    'Proses menyulitkan mesej menggunakan kunci',
                    'Proses menghantar data melalui rangkaian komputer',
                ],
                1,
                'Sort ialah proses mengisih atau menyusun item-item dalam suatu senarai linear mengikut urutan tertentu (menaik atau menurun), penting untuk mendapatkan maklumat dengan cepat dan tepat.',
                10
            ),
            $this->mcq(
                'Bagaimanakah cara bubble sort mengisih item-item dalam senarai mengikut urutan menaik?',
                [
                    'Membandingkan dua item bersebelahan dan menukar tempat jika item pertama lebih besar daripada item kedua, berterusan sehingga item terakhir',
                    'Membahagikan senarai kepada beberapa kategori (baldi) terlebih dahulu',
                    'Membandingkan item pertama dengan item terakhir sahaja',
                    'Mengisih item secara rawak tanpa sebarang perbandingan',
                ],
                0,
                'Bubble sort membandingkan dua item bersebelahan bermula dari item pertama dan kedua. Bagi urutan menaik, item bertukar tempat jika item pertama lebih besar daripada item kedua, dan proses ini berterusan sehingga ke item terakhir, dan diulang sehingga senarai teratur sepenuhnya.',
                10
            ),
            $this->mcq(
                'Apakah langkah PERTAMA dalam algoritma bucket sort?',
                [
                    'Mengisih semua item menggunakan bubble sort',
                    'Mewujudkan beberapa buah baldi untuk menyimpan item-item daripada senarai secara sementara',
                    'Mencantumkan semua item ke dalam senarai baharu',
                    'Menentukan bilangan lajur dalam jadual',
                ],
                1,
                'Langkah pertama algoritma bucket sort ialah mewujudkan beberapa buah baldi untuk menyimpan item-item daripada senarai secara sementara, diikuti dengan menentukan julat setiap baldi.',
                10
            ),
            $this->mcq(
                'Dalam bucket sort, item-item dalam senarai akan diisih sebanyak berapa kali secara keseluruhan?',
                [
                    'Sekali sahaja — semasa memasukkan item ke dalam baldi',
                    'Dua kali — semasa memasukkan item ke dalam baldi mengikut julat, dan semasa mengisih item di dalam setiap baldi',
                    'Tiga kali — sebelum, semasa dan selepas memasukkan ke dalam baldi',
                    'Tidak diisih langsung, hanya dikategorikan',
                ],
                1,
                'Dalam algoritma bucket sort, item-item diisih sebanyak dua kali: isihan pertama berlaku apabila item-item diisih mengikut julat baldi, dan isihan kedua berlaku apabila item-item di dalam setiap baldi diisih mengikut urutan.',
                10
            ),
            $this->mcq(
                'Dalam bidang pengkomputeran, indeks bagi sesuatu senarai bermula dengan nombor berapa?',
                [
                    '-1',
                    '0',
                    '1',
                    '10',
                ],
                1,
                'Dalam bidang pengkomputeran, indeks bagi sesuatu senarai bermula dengan 0, bukan 1. Ini penting semasa mengira indeks item pertengahan dalam binary search.',
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
