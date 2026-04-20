<?php

namespace Database\Factories;

use App\Models\LearningPath;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LearningPath>
 */
class LearningPathFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'path_data' => [
                'survey' => [
                    'interests' => ['programming', 'algorithms'],
                    'experience_level' => 'some_basics',
                    'learning_style' => 'interactive',
                    'time_commitment' => 'moderate',
                    'career_goals' => 'skill_development',
                ],
                'space_payload' => [
                    'weak_topics' => ['programming'],
                    'strong_topics' => ['algorithms'],
                    'interest' => 'skill_development',
                    'level' => 'some_basics',
                    'learning_pace' => 'moderate',
                ],
                'space_response' => [
                    'status' => 'success',
                    'learning_path' => [
                        ['topic' => 'programming', 'difficulty' => 'Easy'],
                        ['topic' => 'Algorithms', 'difficulty' => 'Hard'],
                    ],
                ],
            ],
        ];
    }
}
