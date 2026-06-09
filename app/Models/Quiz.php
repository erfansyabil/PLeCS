<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

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

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'topic_id', 'topicID');
    }

    public function course(): HasOneThrough
    {
        return $this->hasOneThrough(
            LearningContent::class, // final model
            Topic::class,           // intermediate model
            'topicID',              // FK on topics pointing to... (topics.topicID = quizzes.topic_id)
            'id',                   // FK on learning_contents (learning_contents.id)
            'topic_id',             // local key on quizzes
            'courseID',             // local key on topics
        );
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }
}