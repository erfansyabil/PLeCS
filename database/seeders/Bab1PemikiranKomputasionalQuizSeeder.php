<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a quiz for "Bab 1: Asas Pemikiran Komputasional" (Konsep Asas Pemikiran
 * Komputasional) under the course "Asas Sains Komputer Tingkatan 1", based on the
 * KSSM Form 1 textbook chapter covering Leraian, Pengecaman Corak, Peniskalaan and
 * Pengitlakan.
 */
class Bab1PemikiranKomputasionalQuizSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 1')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 1" not found. Skipping Bab 1 quiz seeder.');
            return;
        }

        $topic = Topic::query()
            ->where('courseID', $course->id)
            ->where('name', 'like', '%Pemikiran Komputasional%')
            ->first();

        if (!$topic) {
            $this->command?->warn('Topic "Bab 1: Asas Pemikiran Komputasional" not found for this course. Skipping Bab 1 quiz seeder.');
            return;
        }

        $questions = $this->questions();

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'topic_id' => $topic->topicID,
                'title' => 'Kuiz Bab 1: Konsep Asas Pemikiran Komputasional',
            ],
            [
                'description' => 'Kuiz ini menguji kefahaman murid tentang konsep asas pemikiran komputasional iaitu teknik Leraian, Pengecaman Corak, Peniskalaan dan Pengitlakan.',
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
                'Apakah maksud pemikiran komputasional?',
                [
                    'Proses berfikir seperti komputer',
                    'Satu proses pemikiran bagi menyelesaikan masalah oleh manusia berbantukan mesin atau kedua-duanya, menggunakan konsep asas sains komputer',
                    'Kemahiran menulis kod komputer sahaja',
                    'Kemahiran membaiki perkakasan komputer',
                ],
                1,
                'Pemikiran komputasional bukan berfikir tentang atau seperti komputer, tetapi satu proses pemikiran untuk menyelesaikan masalah menggunakan konsep asas sains komputer.',
                10
            ),
            $this->mcq(
                'Antara berikut, yang manakah BUKAN salah satu daripada empat teknik asas dalam pemikiran komputasional?',
                [
                    'Leraian (Decomposition)',
                    'Pengecaman Corak (Pattern Recognition)',
                    'Peniskalaan (Abstraction)',
                    'Penyulitan (Encryption)',
                ],
                3,
                'Empat teknik asas pemikiran komputasional ialah Leraian, Pengecaman Corak, Peniskalaan dan Pengitlakan (Generalisation). Penyulitan bukan salah satu daripadanya.',
                10
            ),
            $this->mcq(
                'Teknik yang melibatkan pemecahan suatu masalah atau sistem yang kompleks kepada bahagian-bahagian kecil bagi memudahkan pemahaman dan penyelesaian dikenali sebagai...',
                [
                    'Pengecaman Corak',
                    'Leraian',
                    'Peniskalaan',
                    'Pengitlakan',
                ],
                1,
                'Teknik Leraian (Decomposition) memecahkan masalah kompleks kepada bahagian-bahagian kecil supaya setiap bahagian boleh diteliti dan diselesaikan secara berasingan, seperti contoh binaan anak tangga dalam bab ini.',
                10
            ),
            $this->mcq(
                'Dalam proses pemikiran komputasional (Rajah 1.1), selepas masalah dipecahkan, langkah seterusnya ialah...',
                [
                    'Sediakan satu model penyelesaian masalah',
                    'Kenal pasti corak yang sama',
                    'Tinggalkan perkara yang tidak penting',
                    'Uji atur cara',
                ],
                1,
                'Susunan proses pemikiran komputasional ialah: masalah dipecahkan -> kenal pasti corak yang sama -> perkara tidak penting ditinggalkan -> sediakan satu model penyelesaian masalah.',
                10
            ),
            $this->mcq(
                'Selepas meleraikan masalah, bahagian-bahagian kecil dianalisis untuk mengenal pasti kesamaan atau ciri-ciri yang sama. Ini adalah huraian bagi teknik...',
                [
                    'Leraian',
                    'Peniskalaan',
                    'Pengecaman Corak',
                    'Pengitlakan',
                ],
                2,
                'Teknik Pengecaman Corak (Pattern Recognition) mencari kesamaan atau corak antara bahagian-bahagian kecil masalah yang telah dileraikan.',
                10
            ),
            $this->mcq(
                'Dalam contoh masalah binaan anak tangga, aspek manakah yang dianggap PENTING semasa teknik peniskalaan digunakan?',
                [
                    'Saiz batu bata yang digunakan',
                    'Bahan yang digunakan untuk membuat batu bata',
                    'Lebar tangga dan bilangan anak tangga',
                    'Warna batu bata',
                ],
                2,
                'Aspek penting dalam masalah binaan anak tangga ialah lebar tangga (5 batu bata) dan bilangan anak tangga (5), manakala saiz, bahan dan warna batu bata adalah aspek kurang penting yang ditinggalkan semasa peniskalaan.',
                10
            ),
            $this->mcq(
                'Teknik yang melibatkan pembinaan model (formula, teknik, peraturan atau langkah-langkah) yang boleh digunakan untuk menyelesaikan masalah lain yang serupa dikenali sebagai...',
                [
                    'Leraian',
                    'Pengecaman Corak',
                    'Peniskalaan',
                    'Pengitlakan',
                ],
                3,
                'Teknik Pengitlakan (Generalisation) membina satu model penyelesaian, seperti formula "Jumlah batu bata = bilangan batu bata bagi panjang x lebar x tinggi", yang boleh diguna semula untuk masalah serupa.',
                10
            ),
            $this->mcq(
                'Dalam tugasan posmen menghantar surat ke tujuh buah kampung, aspek penting yang perlu diambil kira sebelum membuat keputusan memilih laluan ialah...',
                [
                    'Warna kereta posmen',
                    'Laluan yang mengelakkan jalan rosak (A-D) dan jarak yang paling dekat',
                    'Bilangan surat yang dihantar',
                    'Waktu posmen bertugas',
                ],
                1,
                'Aspek penting bagi tugasan posmen ialah memilih laluan yang tidak melalui A-D (jalan rosak) dan mempunyai jarak yang paling dekat, iaitu bagaimana keputusan dibuat berdasarkan aspek penting.',
                10
            ),
            $this->mcq(
                'Situasi syarikat pembungkusan (memasukkan bungkusan mengikut ketinggian ke dalam kotak) dan situasi syarikat pelancongan (menyusun kumpulan pelancong ke dalam bas) mempunyai persamaan corak penyelesaian, iaitu...',
                [
                    'Mengisi ruang secara rawak tanpa turutan',
                    'Mengisi ruang yang tersedia dengan bilangan/saiz paling banyak dahulu, diikuti bilangan kedua banyak, sehingga semua ruang dipenuhi',
                    'Membahagikan ruang sama rata tanpa mengira saiz',
                    'Menggunakan hanya satu kotak atau bas sahaja',
                ],
                1,
                'Kedua-dua situasi menggunakan corak penyelesaian yang sama: isikan ruang yang ada dengan bilangan/ketinggian paling besar dahulu, diikuti seterusnya, sehingga semua ruang terisi.',
                10
            ),
            $this->mcq(
                'Kemahiran mengesan unsur persamaan dan perbezaan bagi menyelesaikan masalah dan mereka bentuk algoritma berkait rapat dengan ciri-ciri kesamaan dalam sesuatu permasalahan. Apakah faedah utama mengenal pasti lebih banyak corak dalam sesuatu masalah?',
                [
                    'Masalah menjadi lebih rumit untuk diselesaikan',
                    'Masalah dapat diselesaikan dengan lebih cepat dan mudah',
                    'Masalah tidak dapat diselesaikan langsung',
                    'Masalah memerlukan lebih banyak sumber untuk diselesaikan',
                ],
                1,
                'Lebih banyak corak yang dikenal pasti dalam sesuatu masalah, lebih cepat dan mudah masalah tersebut dapat diselesaikan.',
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
