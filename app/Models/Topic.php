<?php

namespace App\Models;

use Database\Factories\TopicFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Topic extends Model
{
    use HasFactory;

    protected $table = 'topics';
    protected $primaryKey = 'topicID';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'topicID',
        'courseID',
        'topic_id',
        'name',
        'description',
        'prerequisites',
        'difficultyLevel',
        'orderIndex',
        'isActive',
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'orderIndex' => 'integer',
    ];

    protected $appends = [
        'id',
        'title',
        'type',
        'parent_id',
    ];

    protected static function newFactory(): TopicFactory
    {
        return TopicFactory::new();
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------
 
    /**
     * The course this topic belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(LearningContent::class, 'courseID', 'id');
    }
 
    /**
     * Quizzes attached to this topic.
     */
    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'topic_id', 'topicID');
    }
 
    public function blocks(): HasMany
    {
        return $this->hasMany(LearningContentBlock::class, 'topic_id', 'topicID');
    }
 
    public function attachments(): HasMany
    {
        return $this->hasMany(LearningContentAttachment::class, 'topic_id', 'topicID');
    }

    public function feedbacks(): HasMany
    {
        return $this->hasMany(Feedback::class, 'topic_id', 'topicID');
    }

    public function guidance(): HasMany
    {
        return $this->hasMany(Guidance::class, 'topic_id', 'topicID');
    }

    public function analytics(): HasMany
    {
        return $this->hasMany(Analytic::class, 'topic_id', 'topicID');
    }
    // Provide compatibility accessors so existing views that expect `title`/`description`
    // on a LearningContent still work when handed a Topic instance.
    public function getTitleAttribute(): ?string
    {
        return $this->name;
    }

    public function getIdAttribute(): int
    {
        return $this->topicID;
    }

    public function getTypeAttribute(): string
    {
        return 'topic';
    }

    public function getParentIdAttribute(): int
    {
        return $this->courseID;
    }

    public function getContentAttribute(): ?string
    {
        return null;
    }

    public function getResourceTypeAttribute(): string
    {
        return 'none';
    }

    public function getResourceUrlAttribute(): ?string
    {
        return null;
    }

    public function getResourcePathAttribute(): ?string
    {
        return null;
    }
}
