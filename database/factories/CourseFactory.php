<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'courseName' => fake()->unique()->sentence(3),
            'description' => fake()->paragraph(),
            'content' => fake()->optional()->paragraphs(asText: true),
            'difficultyLevel' => fake()->randomElement(['Beginner', 'Intermediate', 'Advanced']),
            'isActive' => fake()->boolean(90),
        ];
    }
}
