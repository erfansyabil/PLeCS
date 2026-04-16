<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningContent extends Model
{
    protected $fillable = [
        'title',
        'description',
        'content',
        'type',
        'parent_id',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(LearningContent::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(LearningContent::class, 'parent_id');
    }
}
