<?php

namespace App\Models;

use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use HasFactory;

    protected $table = 'courses';

    protected $primaryKey = 'courseID';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'courseName',
        'description',
        'difficultyLevel',
        'isActive',
    ];

    protected $casts = [
        'isActive' => 'boolean',
    ];

    public function topics(): HasMany
    {
        return $this->hasMany(Topic::class, 'courseID', 'courseID')
            ->orderBy('orderIndex')
            ->orderBy('name');
    }
}