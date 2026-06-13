<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Analytic extends Model
{
    protected $fillable = [
        'student_id', 'course_id', 'topic_id',
        'completion_rate', 'average_score',
        'predicted_mastery_date', 'weak_topics', 'risk_flag',
    ];

    protected $casts = [
        'weak_topics'             => 'array',
        'risk_flag'               => 'boolean',
        'predicted_mastery_date'  => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course(): BelongsTo
    {
        // matches enrollments: courseID → learning_contents.id
        return $this->belongsTo(LearningContent::class, 'course_id', 'id');
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'topic_id', 'topicID');
    }
}