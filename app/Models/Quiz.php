<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'course_id',
        'difficulty_level',
        'points',
        'questions',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'questions' => 'array',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(LearningContent::class, 'course_id');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }
}