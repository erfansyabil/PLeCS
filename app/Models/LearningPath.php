<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LearningPath extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'pathID';
    protected $table = 'learning_paths';
    public $incrementing = true;

    protected $fillable = [
        'studentID',
        'pathName',
        'complexityLevel',
        'isAdaptive',
        'estimatedDuration',
        'currentProgress',
        'status',
        'path_data',
    ];

    protected $casts = [
        'isAdaptive' => 'boolean',
        'currentProgress' => 'float',
        'path_data' => 'array',
    ];

    // A learning path belongs to a student
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'studentID', 'id');
    }

    // Courses in this path, ordered by the pivot's 'order' column
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(
            LearningContent::class,
            'learning_path_courses',
            'pathID',
            'courseID'
        )->withPivot('order')->orderBy('learning_path_courses.order');
    }

    // Convenience: get ordered course IDs
    public function getOrderedCourseIdsAttribute(): array
    {
        return $this->courses()->pluck('courseID')->toArray();
    }

    // Set the order of courses (pass an array of course IDs)
    public function setCourseOrder(array $courseIds): void
    {
        foreach ($courseIds as $index => $courseId) {
            $this->courses()->updateExistingPivot($courseId, ['order' => $index]);
        }
    }

    // Add a course to the end of the path
    public function addCourse($courseId): void
    {
        if (!$this->courses()->where('courseID', $courseId)->exists()) {
            $maxOrder = $this->courses()->max('order') ?? -1;
            $this->courses()->attach($courseId, ['order' => $maxOrder + 1]);
        }
    }

    // Remove a course from the path
    public function removeCourse($courseId): void
    {
        $this->courses()->detach($courseId);
        // Reorder remaining courses
        $remaining = $this->courses()->orderBy('order')->get();
        foreach ($remaining as $idx => $course) {
            $this->courses()->updateExistingPivot($course->id, ['order' => $idx]);
        }
    }

    // In LearningPath model or a service class
    public function getNextRecommendedCourse()
    {
        // Get all course IDs in this path, ordered by pivot 'order'
        $orderedCourseIds = $this->courses()->orderBy('order')->pluck('courseID')->toArray();
        
        // Get IDs of courses the student is enrolled in (active or completed)
        $enrolledCourseIds = Enrollment::where('studentID', $this->studentID)
            ->whereIn('courseID', $orderedCourseIds)
            ->pluck('courseID')
            ->toArray();
        
        // Find first course in ordered list that is not enrolled
        foreach ($orderedCourseIds as $courseId) {
            if (!in_array($courseId, $enrolledCourseIds)) {
                return LearningContent::find($courseId);
            }
        }
        
        return null; // All courses enrolled
    }
}