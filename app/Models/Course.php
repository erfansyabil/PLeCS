<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $table = 'courses';

    protected $primaryKey = 'courseID';

    protected $fillable = [
        'courseName',
        'description',
        'content',
        'difficultyLevel',
        'isActive',
    ];

    protected $casts = [
        'isActive' => 'boolean',
    ];

    protected $appends = [
        'id',
        'title',
        'type',
    ];

    public function topics(): HasMany
    {
        return $this->hasMany(LearningContent::class, 'course_id', 'courseID');
    }

    public function getIdAttribute(): int
    {
        return (int) $this->getKey();
    }

    public function getTitleAttribute(): string
    {
        return (string) $this->courseName;
    }

    public function getTypeAttribute(): string
    {
        return 'course';
    }
}