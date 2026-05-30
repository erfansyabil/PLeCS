<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\LearningContentAttachment;
use App\Models\LearningContentBlock;
use App\Models\CodingExercise;
use App\Models\Quiz;

class LearningContent extends Model
{
    protected $fillable = [
        'title',
        'description',
        'content',
        'type',
        'difficulty_level',
        'estimated_hours',
        'keywords',
        'parent_id',
        'resource_type',
        'resource_url',
        'resource_path',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(LearningContent::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(LearningContent::class, 'parent_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(LearningContentAttachment::class)->orderBy('sort_order')->orderBy('id');
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(LearningContentBlock::class)->orderBy('sort_order')->orderBy('id');
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'course_id');
    }

    public function codingExercises(): HasMany
    {
        return $this->hasMany(CodingExercise::class, 'course_id');
    }
}
