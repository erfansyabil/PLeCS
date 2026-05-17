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

    protected $primaryKey = 'pathID';

    protected $fillable = [
        'studentID',
        'courseID',
        'pathName',
        'complexityLevel',
        'isAdaptive',
        'estimatedDuration',
        'currentProgress',
        'status',
        'path_data',
    ];

    protected $casts = [
        'path_data' => 'array',
        'isAdaptive' => 'boolean',
        'estimatedDuration' => 'integer',
        'currentProgress' => 'integer',
    ];

    /**
     * Get the student that owns this generated learning path.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'studentID');
    }

    /**
     * Filter generated paths by user ID.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('studentID', $userId);
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
     */
    public function survey(): array
    {
        return data_get($this->path_data, 'survey', []);
    }

    /**
     * Get the raw response returned by the external recommender.
     */
    public function spaceResponse(): array
    {
        return data_get($this->path_data, 'space_response', []);
    }

    /**
     * Get normalized recommendations.
     */
    public function recommendations(): array
    {
        return data_get($this->path_data, 'resolved_recommendations', []);
    }
}