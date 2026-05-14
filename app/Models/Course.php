<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    protected $table = 'courses';

    protected $primaryKey = 'courseID';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'courseName',
        'description',
        'content',
        'difficultyLevel',
        'estimatedHours',
        'keywords',
        'resource_type',
        'resource_url',
        'resource_path',
        'isActive',
    ];

    public function topics(): HasMany
    {
        return $this->hasMany(Topic::class, 'courseID', 'courseID');
    }
}
