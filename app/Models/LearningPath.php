<?php

namespace App\Models;

use Database\Factories\LearningPathFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningPath extends Model
{
    /** @use HasFactory<LearningPathFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'path_data',
    ];

    protected $casts = [
        'path_data' => 'array',
    ];

    /**
     * Get the student that owns this generated learning path.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Filter generated paths by user ID.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Sort newest-first by creation time.
     */
    public function scopeLatestFirst(Builder $query): Builder
    {
        return $query->latest('created_at');
    }

    /**
     * Get submitted enrollment survey data from the stored path payload.
     *
     * @return array<string, mixed>
     */
    public function survey(): array
    {
        return data_get($this->path_data, 'survey', []);
    }

    /**
     * Get the payload that was sent to the external recommender.
     *
     * @return array<string, mixed>
     */
    public function spacePayload(): array
    {
        return data_get($this->path_data, 'space_payload', []);
    }

    /**
     * Get the raw response returned by the external recommender.
     *
     * @return array<string, mixed>
     */
    public function spaceResponse(): array
    {
        return data_get($this->path_data, 'space_response', []);
    }

    /**
     * Get normalized recommendations as an array of topic/difficulty entries.
     *
     * @return array<int, array{topic:string, difficulty:string}>
     */
    public function recommendations(): array
    {
        $items = data_get($this->path_data, 'resolved_recommendations', data_get($this->spaceResponse(), 'recommendations', data_get($this->spaceResponse(), 'learning_path', data_get($this->spaceResponse(), 'recommended_courses', []))));

        return collect(is_array($items) ? $items : [])
            ->map(function ($item) {
                return [
                    'topic' => (string) data_get($item, 'title', data_get($item, 'course_title', data_get($item, 'topic', ''))),
                    'difficulty' => (string) data_get($item, 'difficulty', ''),
                ];
            })
            ->filter(fn ($item) => $item['topic'] !== '')
            ->values()
            ->all();
    }
}
