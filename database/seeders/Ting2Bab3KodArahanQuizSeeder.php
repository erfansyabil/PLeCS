<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a quiz for "Bab 3: Kod Arahan" under the course "Asas Sains Komputer
 * Tingkatan 2", based on the KSSM Form 2 textbook chapter covering data types,
 * variables vs constants, input/output functions, comparison and logic operators
 * in code segments (primarily using Python).
 */
class Ting2Bab3KodArahanQuizSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 2')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 2" not found. Skipping Ting 2 Bab 3 quiz seeder.');
            return;
        }

        $topic = Topic::query()
            ->where('courseID', $course->id)
            ->where('name', 'like', '%Kod Arahan%')
            ->first();

        if (!$topic) {
            $this->command?->warn('Topic "Bab 3: Kod Arahan" not found for this course. Skipping Ting 2 Bab 3 quiz seeder.');
            return;
        }

        $questions = $this->questions();

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'topic_id' => $topic->topicID,
                'title' => 'Kuiz Bab 3: Kod Arahan (Tingkatan 2)',
            ],
            [
                'description' => 'Kuiz ini menguji kefahaman murid tentang jenis-jenis data (integer, double, char, string, boolean), pemboleh ubah dan pemalar, fungsi input dan output, serta operator perbandingan dan operator logik dalam segmen kod.',
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
                'Antara berikut, yang manakah TIGA jenis penterjemah yang menukarkan kod arahan kepada bahasa mesin?',
                [
                    'Penghimpun, pengkompil dan pentafsir',
                    'Pemboleh ubah, pemalar dan operator',
                    'Integer, double dan boolean',
                    'Input, output dan proses',
                ],
                0,
                'Terdapat tiga jenis penterjemah: penghimpun (assembly), pengkompil (compiler) dan pentafsir (interpreter). Python menggunakan pentafsir.',
                10
            ),
            $this->mcq(
                'Jenis data manakah yang digunakan untuk mewakili nombor bulat tanpa titik perpuluhan, termasuk nombor negatif dan positif?',
                [
                    'Integer',
                    'Double',
                    'Char',
                    'Boolean',
                ],
                0,
                'Integer ialah nombor yang tidak mengandungi bahagian pecahan dan tidak mempunyai titik perpuluhan, boleh terdiri daripada nombor negatif, sifar dan positif.',
                10
            ),
            $this->mcq(
                'Jenis data manakah yang hanya mempunyai dua nilai sahaja, iaitu Benar (True) atau Palsu (False)?',
                [
                    'Integer',
                    'String',
                    'Boolean',
                    'Double',
                ],
                2,
                'Boolean ialah jenis data yang mempunyai hanya dua nilai, iaitu Benar (True) dan Palsu (False), juga digelar nilai logik. Ia sering digunakan sebagai pernyataan bersyarat dalam struktur kawalan pilihan dan ulangan.',
                10
            ),
            $this->mcq(
                'Apakah perbezaan UTAMA antara pemboleh ubah (variable) dan pemalar (constant) dalam segmen kod?',
                [
                    'Pemboleh ubah menyimpan teks manakala pemalar menyimpan nombor sahaja',
                    'Nilai pemboleh ubah boleh berubah-ubah semasa pelaksanaan atur cara, manakala nilai pemalar adalah tetap dan tidak berubah',
                    'Pemboleh ubah hanya boleh digunakan dalam Python manakala pemalar hanya dalam C++',
                    'Pemalar memerlukan lebih banyak ingatan berbanding pemboleh ubah',
                ],
                1,
                'Pemboleh ubah mempunyai nilai yang boleh berubah-ubah semasa pelaksanaan atur cara, manakala pemalar mempunyai nilai yang tetap dan tidak berubah, contohnya nilai Pi (π) dalam pengiraan luas bulatan.',
                10
            ),
            $this->mcq(
                'Apakah fungsi utama bagi fungsi input (contohnya input() dalam Python)?',
                [
                    'Memaparkan maklumat pada skrin komputer',
                    'Mendapatkan data input daripada pengguna',
                    'Membundarkan nilai perpuluhan',
                    'Menggabungkan dua string',
                ],
                1,
                'Fungsi input digunakan untuk mendapatkan data input daripada pengguna. Apabila fungsi input diaktifkan, atur cara akan menunggu dan meminta pengguna memasukkan data.',
                10
            ),
            $this->mcq(
                'Diberi a = 5 dan b = 10, apakah hasil bagi ungkapan (a < b)?',
                [
                    'True',
                    'False',
                    '5',
                    '10',
                ],
                0,
                'Operator perbandingan "<" bermaksud kurang daripada. Oleh kerana nilai a (5) adalah kurang daripada nilai b (10), maka keadaan (a < b) adalah Benar (True).',
                10
            ),
            $this->mcq(
                'Diberi operan a = Benar dan b = Palsu, apakah hasil bagi (a AND b)?',
                [
                    'Benar',
                    'Palsu',
                    'Tidak dapat ditentukan',
                    '0',
                ],
                1,
                'Operator logik AND (DAN) menjadikan keadaan Benar hanya jika KEDUA-DUA operan adalah Benar. Oleh kerana b adalah Palsu, maka (a AND b) adalah Palsu.',
                10
            ),
            $this->mcq(
                'Operator manakah yang digunakan untuk mendapatkan baki pembahagian antara dua operan (contohnya 11 % 2 = 1)?',
                [
                    'Eksponen (**)',
                    'Floor Division (//)',
                    'Modulus (%)',
                    'Sama dengan (==)',
                ],
                2,
                'Operator Modulus (%) membahagikan operan kiri dengan operan kanan dan memaparkan baki pembahagian. Contohnya, 11 % 2 = 1 kerana 11 dibahagi 2 memberi hasil bahagi 5 dengan baki 1.',
                10
            ),
            $this->mcq(
                'Antara berikut, yang manakah contoh RALAT SINTAKS dalam segmen kod?',
                [
                    'Atur cara memberikan output yang salah akibat syarat yang ditulis tersilap',
                    'Atur cara terhenti tiba-tiba akibat ingatan komputer tidak mencukupi',
                    'Menggunakan sintaks "printf" dalam atur cara Python, sedangkan printf adalah sintaks bagi bahasa C',
                    'Atur cara berjalan tanpa henti akibat syarat gelung yang tidak pernah dipenuhi',
                ],
                2,
                'Ralat sintaks berlaku disebabkan kesilapan penggunaan bahasa pengaturcaraan, seperti menggunakan sintaks bahasa lain (contohnya printf, sintaks C, dalam atur cara Python) yang tidak dikenali oleh pentafsir/pengkompil tersebut.',
                10
            ),
            $this->mcq(
                'Antara syarat berikut, yang manakah BUKAN syarat sah bagi pengisytiharan nama pemboleh ubah?',
                [
                    'Nama pemboleh ubah hanya boleh mengandungi aksara (a-z, A-Z) dan digit (0-9)',
                    'Nama pemboleh ubah harus menggambarkan nilai yang dipegangnya',
                    'Nama pemboleh ubah boleh dimulakan dengan nombor',
                    'Nama pemboleh ubah tidak boleh mempunyai ruang kosong',
                ],
                2,
                'Nama pemboleh ubah TIDAK boleh dimulakan dengan nombor. Syarat sah lain termasuk hanya mengandungi aksara dan digit, menggambarkan nilai yang dipegang, dan tiada ruang kosong.',
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
