<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a quiz for "Bab 2: Perwakilan Data" under the course "Asas Sains Komputer
 * Tingkatan 1", based on the KSSM Form 1 textbook chapter covering binary/decimal
 * number systems, binary arithmetic, ASCII encoding, and image/audio data measurement.
 */
class Bab2PerwakilanDataQuizSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 1')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 1" not found. Skipping Bab 2 quiz seeder.');
            return;
        }

        $topic = Topic::query()
            ->where('courseID', $course->id)
            ->where('name', 'like', '%Perwakilan Data%')
            ->first();

        if (!$topic) {
            $this->command?->warn('Topic "Bab 2: Perwakilan Data" not found for this course. Skipping Bab 2 quiz seeder.');
            return;
        }

        $questions = $this->questions();

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'topic_id' => $topic->topicID,
                'title' => 'Kuiz Bab 2: Perwakilan Data',
            ],
            [
                'description' => 'Kuiz ini menguji kefahaman murid tentang sistem nombor perduaan, operasi tambah dan tolak nombor perduaan, kod ASCII, serta ukuran data bagi imej digital dan audio digital.',
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
                'Mengapakah sistem nombor perduaan dikenali sebagai Sistem Asas 2?',
                [
                    'Kerana ia menggunakan dua digit sahaja iaitu 0 dan 1',
                    'Kerana ia hanya digunakan oleh dua jenis komputer',
                    'Kerana setiap bait mengandungi dua bit',
                    'Kerana ia ditemui oleh dua orang saintis',
                ],
                0,
                'Sistem perduaan dikenali sebagai Sistem Asas 2 kerana ia hanya menggunakan dua pilihan digit iaitu 0 dan 1 untuk mewakili data, berbeza dengan sistem perpuluhan (Asas 10) yang menggunakan digit 0 hingga 9.',
                10
            ),
            $this->mcq(
                'Apakah nilai perpuluhan bagi nombor perduaan 1011?',
                [
                    '9',
                    '10',
                    '11',
                    '13',
                ],
                2,
                'Nilai perduaan 1011 = (1x8) + (0x4) + (1x2) + (1x1) = 8 + 0 + 2 + 1 = 11.',
                10
            ),
            $this->mcq(
                'Dua kaedah yang digunakan untuk menukar nombor perpuluhan kepada nombor perduaan ialah...',
                [
                    'Kaedah tambah dan kaedah tolak',
                    'Kaedah bahagi dengan 2 dan gunakan bakinya, serta kaedah ambil daripada baki',
                    'Kaedah darab dan kaedah bahagi dengan 10',
                    'Kaedah ASCII dan kaedah pinjam',
                ],
                1,
                'Bab ini menerangkan dua kaedah penukaran nombor perpuluhan kepada nombor perduaan: kaedah bahagi dengan 2 dan gunakan bakinya, dan kaedah ambil daripada baki.',
                10
            ),
            $this->mcq(
                'Apakah hasil tambah bagi dua nombor perduaan 100 dan 101?',
                [
                    '1000',
                    '1001',
                    '1010',
                    '1100',
                ],
                1,
                'Menggunakan kaedah lajur: 100 + 101 = 1001 (perduaan), disahkan dengan semakan perpuluhan 4 + 5 = 9.',
                10
            ),
            $this->mcq(
                'Semasa melakukan operasi tolak nombor perduaan, apakah kaedah yang digunakan apabila digit atas lebih kecil daripada digit bawah pada sesuatu lajur?',
                [
                    'Kaedah pinjam',
                    'Kaedah bahagi dengan 2',
                    'Kaedah ambil daripada baki',
                    'Kaedah tatacara 1',
                ],
                0,
                'Kaedah pinjam digunakan dalam penolakan nombor perduaan, iaitu serupa dengan kaedah pinjam dalam penolakan nombor perpuluhan, contohnya bagi tatacara 10 - 1 = 1.',
                10
            ),
            $this->mcq(
                'Kod ASCII bagi huruf "A" ialah 01000001. Apakah maksud kod ASCII?',
                [
                    'Satu set kod piawai yang menggunakan nombor perduaan untuk mewakili setiap aksara',
                    'Satu bahasa pengaturcaraan komputer',
                    'Satu format fail imej digital',
                    'Satu unit ukuran storan data komputer',
                ],
                0,
                'Kod ASCII (American Standard Code for Information Interchange) ialah satu set kod piawai yang menggunakan nombor perduaan untuk mewakili aksara seperti huruf, digit dan simbol supaya komputer dapat memahaminya.',
                10
            ),
            $this->mcq(
                'Resolusi sesuatu imej digital diukur berdasarkan...',
                [
                    'Bilangan warna yang digunakan sahaja',
                    'Bilangan piksel dalam unit dpi (dots per inch)',
                    'Saiz fail imej dalam bait',
                    'Format fail imej yang digunakan',
                ],
                1,
                'Resolusi imej memerihalkan ketajaman dan kejelasan imej, diukur berdasarkan bilangan piksel dalam unit dpi. Semakin tinggi dpi, semakin tinggi resolusi imej.',
                10
            ),
            $this->mcq(
                'Sesuatu imej menggunakan kedalaman warna 8 bit. Berapakah bilangan warna maksimum yang boleh diwakili?',
                [
                    '8',
                    '16',
                    '256',
                    '65 536',
                ],
                2,
                'Kedalaman warna 8 bit boleh mewakili 2 pangkat 8 = 256 warna, seperti ditunjukkan dalam Jadual 2.10 dalam bab ini.',
                10
            ),
            $this->mcq(
                'Bagi audio digital, apakah yang dimaksudkan dengan kadar sampel (sample rate)?',
                [
                    'Bilangan saluran audio yang digunakan (mono atau stereo)',
                    'Bilangan sampel sesaat yang diambil oleh ADC semasa mendigitalkan audio analog',
                    'Format fail yang digunakan untuk menyimpan audio',
                    'Jumlah bit yang digunakan untuk mewakili setiap sampel audio',
                ],
                1,
                'Kadar sampel ialah bilangan sampel sesaat yang diambil oleh analog-to-digital converter (ADC) semasa pendigitalan audio analog, diukur dalam unit hertz (Hz). Semakin tinggi kadar sampel, semakin tepat dan berkualiti audio digital yang terhasil.',
                10
            ),
            $this->mcq(
                'Antara format fail audio berikut, yang manakah TIDAK menyimpan data audio dalam bentuk pola-pola bit 0 dan 1, sebaliknya menyimpan satu set arahan muzik?',
                [
                    'WAVE',
                    'MP3',
                    'MIDI',
                    'BMP',
                ],
                2,
                'Format MIDI tidak menyimpan bunyi sebagai pola bit, tetapi menyimpan set arahan (seperti not muzik) yang mengarah kad bunyi menghasilkan muzik, menyebabkan saiz fail MIDI jauh lebih kecil daripada WAV atau MP3.',
                10
            ),
            $this->mcq(
                'Berapakah bilangan bait bagi 1 kilobait (KB) data komputer?',
                [
                    '1000 bait',
                    '1024 bait',
                    '1 048 576 bait',
                    '8 bait',
                ],
                1,
                'Walaupun mengikut sistem metrik, 1 kilobait data komputer bersamaan 1024 bait, bukan 1000 bait, kerana komputer menggunakan asas 2.',
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
