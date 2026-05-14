<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\LearningContentAttachment;
use App\Models\LearningContentBlock;

class LearningContent extends Model
{
    protected $fillable = [
        'title',
        'description',
        'content',
        'type',
        'parent_id',
        'resource_type',
        'resource_url',
        'resource_path',
        'difficulty_level',
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
}
