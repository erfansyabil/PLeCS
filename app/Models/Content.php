<?php

namespace App\Models;

use Database\Factories\ContentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Content extends Model
{
    /** @use HasFactory<ContentFactory> */
    use HasFactory;

    protected $table = 'contents';

    protected $primaryKey = 'contentID';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'topicID',
        'uploadedBy',
        'title',
        'description',
        'content',
        'type',
        'course_id',
        'resource_type',
        'resource_url',
        'resource_path',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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
