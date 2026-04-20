<?php

namespace Database\Factories;

use App\Models\Topic;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Content>
 */
class ContentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $format = fake()->randomElement(['Video', 'PDF', 'Article', 'Image']);

        return [
            'topicID' => Topic::factory(),
            'uploadedBy' => User::factory()->teacher(),
            'title' => fake()->sentence(5),
            'format' => $format,
            'filePath' => fake()->optional()->passthrough(match ($format) {
                'Video' => 'https://cdn.example.com/videos/'.fake()->uuid().'.mp4',
                'PDF' => 'https://cdn.example.com/docs/'.fake()->uuid().'.pdf',
                'Article' => 'https://example.com/articles/'.fake()->slug(),
                default => 'https://cdn.example.com/images/'.fake()->uuid().'.jpg',
            }),
            'sizeMB' => fake()->randomFloat(2, 0.10, 200.00),
            'isLowBandwidth' => fake()->boolean(25),
            'isSupplementary' => fake()->boolean(40),
        ];
    }
}
