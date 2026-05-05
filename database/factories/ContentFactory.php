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
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'content' => fake()->optional()->paragraphs(asText: true),
            'type' => 'topic',
            'course_id' => null,
            'resource_type' => 'none',
            'resource_url' => null,
            'resource_path' => null,
        ];
    }

    /**
     * Set the topic course relationship.
     */
    public function topic(?int $courseId = null): self
    {
        return $this->state([
            'type' => 'topic',
            'course_id' => $courseId,
        ]);
    }

    /**
     * Legacy alias for creating a top-level content record.
     */
    public function course(): self
    {
        return $this->state([
            'type' => 'course',
            'course_id' => null,
        ]);
    }

    /**
     * Set the topic course relationship.
     */
    public function forCourse(int $courseId): self
    {
        return $this->topic($courseId);
    }

    /**
     * Set the content type to content.
     */
    public function content(?int $parentId = null): self
    {
        return $this->state([
            'type' => 'content',
            'course_id' => $parentId,
        ]);
    }

    /**
     * Set a custom title.
     */
    public function withTitle(string $title): self
    {
        return $this->state([
            'title' => $title,
        ]);
    }

    /**
     * Set a custom description.
     */
    public function withDescription(string $description): self
    {
        return $this->state([
            'description' => $description,
        ]);
    }

    /**
     * Set custom content.
     */
    public function withContent(?string $content): self
    {
        return $this->state([
            'content' => $content,
        ]);
    }

    /**
     * Set a parent content.
     */
    public function withParent(int $courseId): self
    {
        return $this->state([
            'course_id' => $courseId,
        ]);
    }
}
