<?php

namespace Database\Seeders;

use App\Models\CodingExercise;
use App\Models\LearningContent;
use App\Models\Quiz;
use Illuminate\Database\Seeder;

class AssessmentSeeder extends Seeder
{
    public function run(): void
    {
        $courses = LearningContent::query()
            ->where('type', 'course')
            ->orderBy('id')
            ->get()
            ->keyBy('title');

        $this->seedQuiz(
            $courses->get('Asas Sains Komputer Tingkatan 1'),
            'Computational Thinking Quiz',
            'A beginner quiz on computational thinking and basic problem solving.',
            'Beginner',
            20,
            [
                [
                    'question' => 'Which of the following best describes decomposition?',
                    'options' => [
                        'Breaking a problem into smaller parts',
                        'Ignoring all details',
                        'Writing code faster',
                        'Saving files in binary',
                    ],
                    'correct_index' => 0,
                    'points' => 10,
                ],
                [
                    'question' => 'What is the main purpose of an algorithm?',
                    'options' => [
                        'To decorate a user interface',
                        'To provide a step-by-step solution',
                        'To store images',
                        'To compress data',
                    ],
                    'correct_index' => 1,
                    'points' => 10,
                ],
            ]
        );

        $this->seedCodingExercise(
            $courses->get('Asas Sains Komputer Tingkatan 4'),
            'Simple Function Return Exercise',
            'Write a simple function that returns a student name.',
            'Beginner',
            20,
            'Implement a function named getStudentName that returns the string "Amin".',
            "function getStudentName() {\n    return 'Amin';\n}",
            [
                [
                    'label' => 'Uses a return statement',
                    'must_contain' => ['return'],
                    'points' => 10,
                ],
                [
                    'label' => 'Returns the expected name',
                    'must_contain' => ['Amin'],
                    'points' => 10,
                ],
            ]
        );

        $this->seedQuiz(
            $courses->get('Sains Komputer Tingkatan 5'),
            'Web Programming Basics',
            'A short quiz on the fundamentals of web programming.',
            'Intermediate',
            30,
            [
                [
                    'question' => 'Which language primarily adds behavior to web pages?',
                    'options' => ['HTML', 'CSS', 'JavaScript', 'SQL'],
                    'correct_index' => 2,
                    'points' => 15,
                ],
                [
                    'question' => 'What does CSS control?',
                    'options' => ['Database structure', 'Presentation and styling', 'Server routing', 'Compiler errors'],
                    'correct_index' => 1,
                    'points' => 15,
                ],
            ]
        );
    }

    private function seedQuiz(?LearningContent $course, string $title, string $description, string $difficultyLevel, int $points, array $questions): void
    {
        if (!$course) {
            return;
        }

        Quiz::updateOrCreate(
            [
                'course_id' => $course->id,
                'title' => $title,
            ],
            [
                'description' => $description,
                'difficulty_level' => $difficultyLevel,
                'points' => $points,
                'questions' => $questions,
                'is_published' => true,
                'published_at' => now(),
            ]
        );
    }

    private function seedCodingExercise(?LearningContent $course, string $title, string $description, string $difficultyLevel, int $points, string $instructions, string $starterCode, array $testCases): void
    {
        if (!$course) {
            return;
        }

        CodingExercise::updateOrCreate(
            [
                'course_id' => $course->id,
                'title' => $title,
            ],
            [
                'description' => $description,
                'difficulty_level' => $difficultyLevel,
                'points' => $points,
                'instructions' => $instructions,
                'starter_code' => $starterCode,
                'test_cases' => $testCases,
                'is_published' => true,
                'published_at' => now(),
            ]
        );
    }
}