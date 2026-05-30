<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodingExerciseAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'coding_exercise_id',
        'student_id',
        'submission_code',
        'score',
        'max_score',
        'passed',
        'feedback',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'feedback' => 'array',
        'passed' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    public function codingExercise(): BelongsTo
    {
        return $this->belongsTo(CodingExercise::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}