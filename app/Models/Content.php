<?php

namespace App\Models;

use Database\Factories\ContentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Content extends Model
{
    /** @use HasFactory<ContentFactory> */
    use HasFactory;

    protected $table = 'learning_contents';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'title',
        'description',
        'content',
        'type',
        'parent_id',
        'resource_type',
        'resource_url',
        'resource_path',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Parent content relationship (for topics under courses, lessons under topics, etc.).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Content::class, 'parent_id', 'id');
    }

    /**
     * Child content relationship.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Content::class, 'parent_id', 'id');
    }

    public function prerequisites(): BelongsToMany
    {
        return $this->belongsToMany(
            Content::class,
            'learning_content_prerequisites',
            'learning_content_id',
            'prerequisite_learning_content_id'
        )->withTimestamps();
    }

    public function dependentContents(): BelongsToMany
    {
        return $this->belongsToMany(
            Content::class,
            'learning_content_prerequisites',
            'prerequisite_learning_content_id',
            'learning_content_id'
        )->withTimestamps();
    }
}
