<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\Topic;
use Illuminate\Database\Seeder;

/**
 * Creates the missing "Bab 4: Kod Arahan" topic under the course "Asas Sains
 * Komputer Tingkatan 3". The textbook has four chapters, but only the first
 * three (Bab 1-3) had been seeded into the topics table.
 */
class Ting3Bab4KodArahanTopicSeeder extends Seeder
{
    public function run(): void
    {
        $course = LearningContent::query()
            ->where('type', 'course')
            ->where('title', 'Asas Sains Komputer Tingkatan 3')
            ->first();

        if (!$course) {
            $this->command?->warn('Course "Asas Sains Komputer Tingkatan 3" not found. Skipping Ting 3 Bab 4 topic seeder.');
            return;
        }

        Topic::query()->firstOrCreate(
            [
                'courseID' => $course->id,
                'name' => 'Bab 4: Kod Arahan',
            ],
            [
                'description' => '<p class="ql-align-justify">Pengurusan data dalam sesebuah organisasi memerlukan pangkalan data yang cekap. Dalam bab ini, anda akan mempelajari tentang pangkalan data, Structured Query Language (SQL), serta penggunaan function dan procedure dalam struktur kod arahan.</p>',
                'prerequisites' => null,
                'difficultyLevel' => 'Intermediate',
                'orderIndex' => 4,
                'isActive' => true,
            ]
        );
    }
}
