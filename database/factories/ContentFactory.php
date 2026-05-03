<?php

namespace Database\Factories;

use App\Models\Content;
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
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'content' => fake()->optional()->paragraphs(asText: true),
            'type' => fake()->randomElement(['course', 'topic', 'content']),
            'parent_id' => null,
            'resource_type' => 'none',
            'resource_url' => null,
            'resource_path' => null,
        ];
    }

    /**
     * Set the content type to course.
     */
    public function course(): self
    {
        return $this->state([
            'type' => 'course',
            'parent_id' => null,
        ]);
    }

    /**
     * Set the content type to topic.
     */
    public function topic(?int $parentId = null): self
    {
        return $this->state([
            'type' => 'topic',
            'parent_id' => $parentId,
        ]);
    }

    /**
     * Set the content type to content.
     */
    public function content(?int $parentId = null): self
    {
        return $this->state([
            'type' => 'content',
            'parent_id' => $parentId,
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
    public function withParent(int $parentId): self
    {
        return $this->state([
            'parent_id' => $parentId,
        ]);
    }
}
