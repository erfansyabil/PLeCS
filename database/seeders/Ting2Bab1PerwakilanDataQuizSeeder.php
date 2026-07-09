<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a quiz for "Bab 1: Perwakilan Data" under the course "Asas Sains Komputer
 * Tingkatan 2", based on the KSSM Form 2 textbook chapter covering octal (Sistem
 * Nombor Perlapanan) and hexadecimal (Sistem Nombor Perenambelasan) number systems.
 */
class Ting2Bab1PerwakilanDataQuizSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 2')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 2" not found. Skipping Ting 2 Bab 1 quiz seeder.');
            return;
        }

        $topic = Topic::query()
            ->where('courseID', $course->id)
            ->where('name', 'like', '%Perwakilan Data%')
            ->first();

        if (!$topic) {
            $this->command?->warn('Topic "Bab 1: Perwakilan Data" not found for this course. Skipping Ting 2 Bab 1 quiz seeder.');
            return;
        }

        $questions = $this->questions();

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'topic_id' => $topic->topicID,
                'title' => 'Kuiz Bab 1: Perwakilan Data (Tingkatan 2)',
            ],
            [
                'description' => 'Kuiz ini menguji kefahaman murid tentang sistem nombor perlapanan (oktal) dan sistem nombor perenambelasan (heksadesimal), penukaran antara sistem nombor, serta perkaitannya dengan kod ASCII.',
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
                'Mengapakah sistem nombor perlapanan dikenali sebagai Sistem Asas 8?',
                [
                    'Kerana ia menggunakan lapan pilihan digit, iaitu 0 hingga 7',
                    'Kerana satu bait mempunyai lapan bit',
                    'Kerana ia ditemui oleh lapan orang saintis',
                    'Kerana ia hanya digunakan dalam lapan bahasa pengaturcaraan',
                ],
                0,
                'Sistem nombor perlapanan (oktal) dikenali sebagai Sistem Asas 8 kerana ia menggunakan lapan pilihan digit sahaja, iaitu 0, 1, 2, 3, 4, 5, 6 dan 7.',
                10
            ),
            $this->mcq(
                'Berapakah bilangan pilihan digit yang digunakan dalam sistem nombor perenambelasan (heksadesimal)?',
                [
                    '8 digit (0 hingga 7)',
                    '10 digit (0 hingga 9)',
                    '16 pilihan digit (0 hingga 9 dan A hingga F)',
                    '2 digit (0 dan 1)',
                ],
                2,
                'Sistem nombor perenambelasan menggunakan sepuluh digit (0-9) dan enam abjad (A-F), menjadikan sebanyak 16 pilihan digit. Oleh itu, ia dikenali sebagai Sistem Asas 16.',
                10
            ),
            $this->mcq(
                'Apakah kaedah yang lazim digunakan untuk menukar nombor perpuluhan kepada nombor perlapanan?',
                [
                    'Kaedah bahagi dengan 8 dan gunakan bakinya',
                    'Kaedah darab dengan 8',
                    'Kaedah tolak dengan 8 secara berulang',
                    'Kaedah bahagi dengan 2 dan gunakan bakinya',
                ],
                0,
                'Kaedah bahagi dengan 8 dan gunakan bakinya digunakan untuk menukar nombor perpuluhan kepada nombor perlapanan: nombor dibahagi berulang kali dengan 8, dan bakinya dibaca secara menyongsang (dari bawah ke atas).',
                10
            ),
            $this->mcq(
                'Berapakah nilai tempat bagi digit keempat (dari kanan) dalam sistem nombor perlapanan?',
                [
                    '8',
                    '64',
                    '512',
                    '4096',
                ],
                2,
                'Nilai tempat sistem nombor perlapanan ialah 1 (8^0), 8 (8^1), 64 (8^2), 512 (8^3) dan seterusnya. Digit keempat dari kanan mempunyai nilai tempat 512.',
                10
            ),
            $this->mcq(
                'Berapakah bilangan digit nombor perduaan yang bersamaan dengan SATU digit nombor perlapanan?',
                [
                    'Dua digit',
                    'Tiga digit',
                    'Empat digit',
                    'Lapan digit',
                ],
                1,
                'Oleh kerana sistem nombor perlapanan mempunyai lapan pilihan digit (2^3 = 8), setiap tiga digit nombor perduaan bersamaan dengan satu digit nombor perlapanan.',
                10
            ),
            $this->mcq(
                'Dalam sistem nombor perenambelasan, digit "A" mewakili nilai berapa semasa melakukan pengiraan?',
                [
                    '1',
                    '9',
                    '10',
                    '16',
                ],
                2,
                'Dalam sistem nombor perenambelasan, digit A, B, C, D, E dan F mewakili nilai 10, 11, 12, 13, 14 dan 15 semasa melakukan pengiraan.',
                10
            ),
            $this->mcq(
                'Berapakah nilai tempat bagi digit ketiga (dari kanan) dalam sistem nombor perenambelasan?',
                [
                    '16',
                    '64',
                    '256',
                    '4096',
                ],
                2,
                'Nilai tempat sistem nombor perenambelasan ialah 1 (16^0), 16 (16^1), 256 (16^2), 4096 (16^3) dan seterusnya. Digit ketiga dari kanan mempunyai nilai tempat 256.',
                10
            ),
            $this->mcq(
                'Mengapakah sistem nombor perenambelasan penting dalam mewakili warna pada alatan digital dalam model warna RGB?',
                [
                    'Kerana setiap warna (Red, Green, Blue) diwakili oleh dua nombor perenambelasan, membolehkan lebih 16 juta warna diwakili',
                    'Kerana warna hanya boleh diwakili menggunakan sistem perenambelasan',
                    'Kerana sistem perenambelasan lebih pantas diproses berbanding sistem perduaan',
                    'Kerana sistem perenambelasan tidak memerlukan penukaran kepada nombor perduaan',
                ],
                0,
                'Dalam model warna RGB, setiap warna (Red, Green, Blue) diwakili oleh dua nombor perenambelasan (256 varian setiap satu), menghasilkan lebih daripada 16 juta kombinasi warna secara keseluruhan.',
                10
            ),
            $this->mcq(
                'Berdasarkan Contoh 1.8 dalam bab ini, mengapakah kod ASCII dalam bentuk nombor perlapanan lebih efisien berbanding nombor perduaan bagi perkataan yang sama?',
                [
                    'Kerana nombor perlapanan menggunakan lebih sedikit digit berbanding nombor perduaan untuk mewakili aksara yang sama',
                    'Kerana nombor perlapanan tidak memerlukan penukaran kepada kod ASCII',
                    'Kerana nombor perlapanan hanya digunakan untuk huruf besar sahaja',
                    'Kerana nombor perduaan tidak dapat mewakili kod ASCII',
                ],
                0,
                'Contohnya, perkataan "TOLONG" memerlukan 48 digit nombor perduaan tetapi hanya 18 digit dalam perwakilan nombor perlapanan, menjadikan penyimpanan dan pembacaan lebih efisien.',
                10
            ),
            $this->mcq(
                'Bagaimanakah nombor perlapanan 401 ditulis dengan menggunakan tanda subskrip yang betul?',
                [
                    '401_2',
                    '401_8',
                    '401_10',
                    '401_16',
                ],
                1,
                'Nombor dalam sistem nombor perlapanan ditandakan dengan subskrip 8 pada hujung nombor, contohnya nombor perlapanan 401 ditulis sebagai 401 dengan subskrip 8.',
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
