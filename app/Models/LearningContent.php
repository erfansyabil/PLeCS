<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'content',
        'course_id',
        'resource_type',
        'resource_url',
        'resource_path',
        'difficulty_level',
    ];

    protected $casts = [
        'course_id' => 'integer',
    ];

    protected $appends = [
        'type',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'courseID');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(LearningContentAttachment::class)->orderBy('sort_order')->orderBy('id');
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(LearningContentBlock::class)->orderBy('sort_order')->orderBy('id');
    }

    public function getTypeAttribute(): string
    {
        return 'topic';
    }
}
