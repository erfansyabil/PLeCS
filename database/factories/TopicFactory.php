<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Topic>
 */
class TopicFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'courseID' => Course::factory(),
            'name' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'prerequisites' => fake()->optional()->randomElement(['1', '1,2', '2,3']),
            'difficultyLevel' => fake()->randomElement(['Beginner', 'Intermediate', 'Advanced']),
            'orderIndex' => fake()->numberBetween(1, 20),
            'isActive' => fake()->boolean(90),
        ];
    }
}
