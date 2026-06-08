<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdditionalLearningResource extends Model
{
    use HasFactory;

    protected $table = 'additional_learning_resources';

    protected $fillable = [
        'topic_id',
        'course_id',
        'title',
        'description',
        'type',
        'url',
        'file_path',
        'order_index',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order_index' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'topic_id', 'topicID');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(LearningContent::class, 'course_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
