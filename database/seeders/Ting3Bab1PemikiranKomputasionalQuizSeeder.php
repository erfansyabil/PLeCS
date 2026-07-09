<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds a quiz for "Bab 1: Asas Pemikiran Komputasional" under the course "Asas
 * Sains Komputer Tingkatan 3", based on the KSSM Form 3 textbook chapter covering
 * the five phases of program development and how computational thinking techniques
 * (decomposition, pattern recognition, abstraction, generalisation) apply to each phase.
 */
class Ting3Bab1PemikiranKomputasionalQuizSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 3')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 3" not found. Skipping Ting 3 Bab 1 quiz seeder.');
            return;
        }

        $topic = Topic::query()
            ->where('courseID', $course->id)
            ->where('name', 'like', '%Pemikiran Komputasional%')
            ->first();

        if (!$topic) {
            $this->command?->warn('Topic "Bab 1: Asas Pemikiran Komputasional" not found for this course. Skipping Ting 3 Bab 1 quiz seeder.');
            return;
        }

        $questions = $this->questions();

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'topic_id' => $topic->topicID,
                'title' => 'Kuiz Bab 1: Konsep Asas Pemikiran Komputasional (Tingkatan 3)',
            ],
            [
                'description' => 'Kuiz ini menguji kefahaman murid tentang fasa-fasa pembangunan atur cara dan penggunaan teknik-teknik pemikiran komputasional (leraian, pengecaman corak, peniskalaan, pengitlakan) dalam setiap fasa.',
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
                'Apakah urutan yang betul bagi lima fasa pembangunan atur cara?',
                [
                    'Analisis masalah, reka bentuk atur cara, pengekodan, pengujian dan penyahpepijatan, dokumentasi',
                    'Pengekodan, analisis masalah, reka bentuk atur cara, dokumentasi, pengujian dan penyahpepijatan',
                    'Reka bentuk atur cara, analisis masalah, dokumentasi, pengekodan, pengujian dan penyahpepijatan',
                    'Dokumentasi, pengekodan, analisis masalah, reka bentuk atur cara, pengujian dan penyahpepijatan',
                ],
                0,
                'Lima fasa pembangunan atur cara mengikut urutan yang betul ialah: fasa analisis masalah, fasa reka bentuk atur cara, fasa pengekodan, fasa pengujian dan penyahpepijatan, serta fasa dokumentasi.',
                10
            ),
            $this->mcq(
                'Dalam fasa analisis masalah bagi membina atur cara mengira luas dan perimeter padang bola, teknik pemikiran komputasional yang digunakan untuk memecahkan masalah besar kepada "kira luas" dan "kira perimeter" ialah...',
                [
                    'Teknik Peniskalaan',
                    'Teknik Leraian',
                    'Teknik Pengitlakan',
                    'Teknik Pengecaman Corak',
                ],
                1,
                'Teknik Leraian digunakan dalam fasa analisis masalah untuk memecahkan masalah besar (membina atur cara mengira luas dan perimeter) kepada bahagian-bahagian kecil (kira luas, kira perimeter) yang lebih mudah diselesaikan.',
                10
            ),
            $this->mcq(
                'Dalam fasa reka bentuk atur cara, teknik yang digunakan untuk mengenal pasti bahawa "kira luas" dan "kira perimeter" kedua-duanya menggunakan pemboleh ubah yang sama, iaitu panjang dan lebar, dikenali sebagai...',
                [
                    'Teknik Leraian',
                    'Teknik Pengecaman Corak',
                    'Teknik Peniskalaan',
                    'Teknik Pengitlakan',
                ],
                1,
                'Teknik Pengecaman Corak digunakan untuk mengenal pasti corak yang sama antara bahagian-bahagian kecil masalah, seperti penggunaan pemboleh ubah panjang dan lebar dalam kedua-dua pengiraan luas dan perimeter.',
                10
            ),
            $this->mcq(
                'Teknik yang meninggalkan aspek kurang penting dan memberikan penekanan kepada aspek penting seperti panjang dan lebar padang bola serta formula matematik yang berkaitan dikenali sebagai...',
                [
                    'Teknik Leraian',
                    'Teknik Pengecaman Corak',
                    'Teknik Peniskalaan',
                    'Teknik Pengitlakan',
                ],
                2,
                'Teknik Peniskalaan meninggalkan aspek-aspek kurang penting dan menekankan aspek-aspek penting, seperti panjang dan lebar padang bola beserta formula matematik yang diperlukan untuk menyelesaikan masalah.',
                10
            ),
            $this->mcq(
                'Teknik yang menghasilkan algoritma (pseudokod atau carta alir) berdasarkan maklumat yang diperoleh daripada leraian dan peniskalaan masalah dikenali sebagai...',
                [
                    'Teknik Leraian',
                    'Teknik Pengecaman Corak',
                    'Teknik Peniskalaan',
                    'Teknik Pengitlakan',
                ],
                3,
                'Teknik Pengitlakan menghasilkan model penyelesaian masalah, iaitu algoritma dalam bentuk pseudokod atau carta alir, berdasarkan maklumat yang diperoleh daripada leraian dan peniskalaan.',
                10
            ),
            $this->mcq(
                'Ralat yang disebabkan oleh penggunaan sintaks sesuatu bahasa pengaturcaraan yang tidak betul, dan paparan mesejnya selalu mengandungi perkataan "invalid syntax", dikenali sebagai...',
                [
                    'Ralat sintaks',
                    'Ralat masa larian',
                    'Ralat logik',
                    'Ralat pengekodan',
                ],
                0,
                'Ralat sintaks (syntax error) disebabkan oleh penggunaan sintaks bahasa pengaturcaraan yang tidak betul dalam penulisan atur cara, dan mesej ralatnya selalu mengandungi perkataan "invalid syntax".',
                10
            ),
            $this->mcq(
                'Ralat yang disebabkan oleh kemasukan data yang tidak menepati kehendak arahan, menyebabkan pelaksanaan atur cara terhenti secara tiba-tiba, dikenali sebagai...',
                [
                    'Ralat sintaks',
                    'Ralat masa larian',
                    'Ralat logik',
                    'Ralat dokumentasi',
                ],
                1,
                'Ralat masa larian (runtime error) disebabkan oleh kemasukan data yang tidak menepati kehendak arahan, menyebabkan atur cara terhenti secara tiba-tiba dengan paparan mesej ralat yang menyatakan baris kod yang salah.',
                10
            ),
            $this->mcq(
                'Ralat yang disebabkan oleh kesilapan logik pengatur cara sehingga atur cara menghasilkan output yang salah, walaupun tiada paparan mesej ralat, dikenali sebagai...',
                [
                    'Ralat sintaks',
                    'Ralat masa larian',
                    'Ralat logik',
                    'Ralat kompilasi',
                ],
                2,
                'Ralat logik (logical error) disebabkan oleh kesilapan logik pengatur cara, menghasilkan output yang salah tanpa sebarang paparan mesej ralat, menjadikannya sukar dikesan.',
                10
            ),
            $this->mcq(
                'Semasa fasa pengujian dan penyahpepijatan, apakah kegunaan teknik pengecaman corak?',
                [
                    'Mengenal pasti ciri-ciri persamaan dan perbezaan pada mesej ralat bagi menentukan jenis ralat (sintaks, masa larian atau logik)',
                    'Memecahkan masalah besar kepada bahagian-bahagian kecil sahaja',
                    'Menulis pseudokod dan melukis carta alir',
                    'Memilih bahasa pengaturcaraan yang sesuai',
                ],
                0,
                'Teknik pengecaman corak digunakan dalam fasa pengujian untuk mengenal pasti ciri-ciri persamaan dan perbezaan pada paparan mesej ralat, membantu menentukan sama ada ralat tersebut adalah ralat sintaks, ralat masa larian atau ralat logik.',
                10
            ),
            $this->mcq(
                'Antara berikut, yang manakah TERMASUK dalam fasa reka bentuk atur cara?',
                [
                    'Menemu bual pelanggan untuk mengetahui keperluan sistem',
                    'Menulis pseudokod, melukis carta alir dan mereka bentuk antara muka pengguna',
                    'Memilih bahasa pengaturcaraan dan mengekod atur cara',
                    'Menyediakan dokumentasi dalaman dan luaran',
                ],
                1,
                'Dalam fasa reka bentuk atur cara, pengatur cara akan menulis pseudokod, melukis carta alir dan mereka bentuk antara muka pengguna (GUI) berdasarkan maklumat yang diperoleh dari fasa analisis masalah.',
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
