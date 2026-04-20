<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningContentAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'learning_content_id',
        'title',
        'type',
        'file_path',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function learningContent(): BelongsTo
    {
        return $this->belongsTo(LearningContent::class);
    }
}
