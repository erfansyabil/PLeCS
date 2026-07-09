<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a quiz for "Bab 2: Perwakilan Data" under the course "Asas Sains Komputer
 * Tingkatan 3", based on the KSSM Form 3 textbook chapter covering cryptography
 * (kriptografi), encryption/decryption, and cipher methods (Reverse, Substitution —
 * Caesar and Pigpen, Transposition — Columnar and Rail Fence).
 */
class Ting3Bab2PerwakilanDataQuizSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 3')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 3" not found. Skipping Ting 3 Bab 2 quiz seeder.');
            return;
        }

        $topic = Topic::query()
            ->where('courseID', $course->id)
            ->where('name', 'like', '%Perwakilan Data%')
            ->first();

        if (!$topic) {
            $this->command?->warn('Topic "Bab 2: Perwakilan Data" not found for this course. Skipping Ting 3 Bab 2 quiz seeder.');
            return;
        }

        $questions = $this->questions();

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'topic_id' => $topic->topicID,
                'title' => 'Kuiz Bab 2: Perwakilan Data (Tingkatan 3)',
            ],
            [
                'description' => 'Kuiz ini menguji kefahaman murid tentang kriptografi, proses penyulitan dan nyahsulit, serta kaedah-kaedah sifer seperti Reverse cipher, Caesar Cipher, Pigpen Cipher, Columnar Transposition dan Rail Fence Cipher.',
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
                'Perkataan "kriptografi" berasal daripada bahasa Yunani, "kriptos" dan "graphein". Apakah maksud kedua-dua suku kata ini?',
                [
                    'Kriptos bermaksud "sembunyi" dan graphein bermaksud "untuk tulis"',
                    'Kriptos bermaksud "kunci" dan graphein bermaksud "gambar"',
                    'Kriptos bermaksud "nombor" dan graphein bermaksud "huruf"',
                    'Kriptos bermaksud "mesej" dan graphein bermaksud "hantar"',
                ],
                0,
                'Kriptografi berasal daripada "kriptos" (sembunyi) dan "graphein" (untuk tulis), menjadikan kriptografi sebagai kajian tentang teknik kerahsiaan atau keselamatan komunikasi data.',
                10
            ),
            $this->mcq(
                'Apakah proses yang menukarkan teks biasa (plaintext) kepada teks sifer (ciphertext) yang tidak bermakna?',
                [
                    'Nyahsulit (decryption)',
                    'Penyulitan (encryption)',
                    'Pengesahan (authentication)',
                    'Kompresi',
                ],
                1,
                'Penyulitan (encryption) ialah proses penukaran teks biasa kepada teks sifer menggunakan algoritma dan kunci penyulitan, manakala nyahsulit (decryption) ialah proses sebaliknya.',
                10
            ),
            $this->mcq(
                'Antara berikut, yang manakah BUKAN salah satu daripada empat kepentingan perkhidmatan keselamatan data kriptografi?',
                [
                    'Kerahsiaan (Confidentiality)',
                    'Pengesahan (Authentication)',
                    'Kelajuan (Speed)',
                    'Tiada Sangkalan (Non-repudiation)',
                ],
                2,
                'Empat kepentingan perkhidmatan keselamatan data kriptografi ialah Kerahsiaan, Pengesahan, Integriti dan Tiada Sangkalan. Kelajuan bukan salah satu daripadanya.',
                10
            ),
            $this->mcq(
                'Apakah perbezaan utama antara sifer kunci simetri dan sifer kunci tidak simetri?',
                [
                    'Sifer kunci simetri menggunakan kunci yang sama untuk penyulitan dan nyahsulit, manakala sifer kunci tidak simetri menggunakan dua kunci berbeza (kunci awam dan kunci persendirian)',
                    'Sifer kunci simetri hanya digunakan untuk gambar, manakala sifer kunci tidak simetri untuk teks sahaja',
                    'Sifer kunci simetri lebih kompleks berbanding sifer kunci tidak simetri',
                    'Sifer kunci simetri tidak memerlukan sebarang kunci',
                ],
                0,
                'Sifer kunci simetri (termasuk semua sifer klasik) menggunakan kunci yang sama untuk penyulitan dan nyahsulit. Sifer kunci tidak simetri (digunakan dalam sifer moden) melibatkan dua kunci berbeza — kunci awam dan kunci persendirian.',
                10
            ),
            $this->mcq(
                'Kaedah sifer manakah yang menyulitkan mesej dengan menyongsangkan susunan abjad, perkataan atau keseluruhan mesej?',
                [
                    'Caesar Cipher',
                    'Reverse cipher',
                    'Columnar Transposition',
                    'Pigpen Cipher',
                ],
                1,
                'Reverse cipher ialah kaedah sifer yang paling mudah, menggunakan cara songsangan untuk menyulitkan mesej — sama ada songsangan berdasarkan abjad, perkataan atau seluruh mesej.',
                10
            ),
            $this->mcq(
                'Dalam Caesar Cipher, apakah yang dimaksudkan dengan kunci K = 5?',
                [
                    'Lima abjad akan dipadamkan daripada mesej',
                    'Anjakan sebanyak lima tempat ke kanan dilakukan pada susunan abjad',
                    'Mesej perlu diulang sebanyak lima kali',
                    'Lima kunci berbeza digunakan untuk penyulitan',
                ],
                1,
                'Dalam Caesar Cipher (shift cipher), kunci K mewakili bilangan anjakan pada susunan abjad. K = 5 bermaksud setiap abjad dalam teks biasa dianjakkan sebanyak lima tempat ke kanan untuk mendapatkan abjad teks sifer.',
                10
            ),
            $this->mcq(
                'Pigpen Cipher ialah sejenis Substitution cipher yang menggantikan setiap abjad dengan...',
                [
                    'Nombor perduaan',
                    'Simbol grafik yang sepadan berdasarkan garis sempadan dalam grid',
                    'Abjad lain dalam susunan abjad yang dianjakkan',
                    'Kod ASCII',
                ],
                1,
                'Pigpen Cipher menggantikan setiap abjad dengan simbol grafik yang sepadan, terbentuk daripada garis sempadan yang berbeza dalam suatu grid — bukan menganjakkan abjad seperti Caesar Cipher.',
                10
            ),
            $this->mcq(
                'Apakah perbezaan utama antara Substitution cipher dan Transposition cipher?',
                [
                    'Substitution cipher menggantikan abjad dengan abjad atau simbol lain, manakala Transposition cipher mengubah kedudukan abjad dalam teks tanpa menggantikannya',
                    'Substitution cipher hanya digunakan untuk nombor, manakala Transposition cipher untuk huruf sahaja',
                    'Substitution cipher tidak memerlukan kunci, manakala Transposition cipher memerlukan kunci',
                    'Tiada perbezaan antara kedua-dua kaedah ini',
                ],
                0,
                'Substitution cipher menggantikan satu unit teks biasa dengan unit teks lain (abjad atau simbol). Transposition cipher pula mengekalkan abjad asal tetapi mengubah kedudukannya dalam teks (pemutaran/pencampuran).',
                10
            ),
            $this->mcq(
                'Dalam Columnar Transposition, apakah yang menentukan bilangan lajur dalam jadual yang dibina?',
                [
                    'Bilangan perkataan dalam mesej',
                    'Bilangan abjad dalam kunci (perkataan) yang dipilih',
                    'Panjang mesej dibahagi dengan dua',
                    'Bilangan baris yang ditetapkan oleh penghantar',
                ],
                1,
                'Dalam Columnar Transposition, satu perkataan dipilih sebagai kunci penyulitan. Bilangan abjad dalam kunci tersebut menentukan bilangan lajur dalam jadual yang dibina.',
                10
            ),
            $this->mcq(
                'Dalam Rail Fence Cipher, apakah yang dimaksudkan dengan "kunci" bagi kaedah sifer ini?',
                [
                    'Bilangan abjad dalam mesej',
                    'Bilangan baris (rows) yang digunakan untuk menulis semula abjad mengikut corak zig-zag',
                    'Bilangan lajur dalam jadual Columnar Transposition',
                    'Anjakan abjad dalam susunan A hingga Z',
                ],
                1,
                'Dalam Rail Fence Cipher (juga dikenali sebagai zig-zag cipher), nilai kunci merujuk kepada bilangan baris yang digunakan untuk menulis semula abjad-abjad teks biasa mengikut corak zig-zag seperti pagar.',
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
