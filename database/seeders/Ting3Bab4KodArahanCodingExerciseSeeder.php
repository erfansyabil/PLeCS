<?php

namespace Database\Seeders;

use App\Models\CodingExercise;
use App\Models\LearningContent;
use Illuminate\Database\Seeder;

/**
 * Seeds a coding exercise for the course "Asas Sains Komputer Tingkatan 3",
 * targeting Bab 4: Kod Arahan's coverage of user-defined functions in Python
 * (Subtopik 4.2.1-4.2.4), where a function must accept input and return a value.
 */
class Ting3Bab4KodArahanCodingExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 3')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 3" not found. Skipping Ting 3 Bab 4 coding exercise seeder.');
            return;
        }

        CodingExercise::updateOrCreate(
            [
                'course_id' => $course->id,
                'title' => 'Kira Purata Markah Menggunakan Function',
            ],
            [
                'description' => 'Latihan ini menguji kefahaman murid tentang penggunaan function dalam Python untuk memulangkan satu nilai, sejajar dengan Subtopik 4.2.1 hingga 4.2.4 dalam Bab 4: Kod Arahan.',
                'difficulty_level' => 'Intermediate',
                'points' => 100,
                'instructions' => "Bina satu function Python bernama kira_purata yang menerima satu senarai markah (parameter) dan memulangkan (return) nilai purata markah tersebut.\n\n"
                    . "Function anda mesti:\n"
                    . "1. Ditakrifkan menggunakan `def kira_purata(...)`.\n"
                    . "2. Menggunakan fungsi terbina dalam (built-in function) sum() untuk mengira jumlah markah.\n"
                    . "3. Menggunakan fungsi terbina dalam len() untuk mengira bilangan markah.\n"
                    . "4. Menggunakan pernyataan return untuk memulangkan nilai purata.\n\n"
                    . "Kemudian, panggil function tersebut dengan senarai markah [87, 70, 80, 78] dan paparkan (print) hasilnya.",
                'starter_code' => "def kira_purata(markah):\n"
                    . "    # Tulis kod anda di sini\n"
                    . "    pass\n\n"
                    . "# Panggil function dan paparkan hasilnya\n"
                    . "senarai_markah = [87, 70, 80, 78]\n",
                'test_cases' => [
                    [
                        'label' => 'Mentakrifkan function dengan nama yang betul',
                        'must_contain' => ['def kira_purata'],
                        'points' => 20,
                    ],
                    [
                        'label' => 'Menggunakan fungsi terbina dalam sum()',
                        'must_contain' => ['sum('],
                        'points' => 20,
                    ],
                    [
                        'label' => 'Menggunakan fungsi terbina dalam len()',
                        'must_contain' => ['len('],
                        'points' => 20,
                    ],
                    [
                        'label' => 'Menggunakan pernyataan return untuk memulangkan nilai',
                        'must_contain' => ['return'],
                        'points' => 20,
                    ],
                    [
                        'label' => 'Memanggil dan memaparkan hasil function',
                        'must_contain' => ['print('],
                        'points' => 20,
                    ],
                ],
                'is_published' => true,
                'published_at' => now(),
            ]
        );
    }
}
