<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    protected $fillable = [
        'studentID',
        'courseID',
        'pathID',
        'status',
        'progress',
        'enrolled_at',
        'completed_at',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'studentID');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(LearningContent::class, 'courseID');
    }

    public function learningPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class, 'pathID', 'pathID');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}