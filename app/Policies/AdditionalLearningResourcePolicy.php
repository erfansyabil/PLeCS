<?php

namespace App\Policies;

use App\Models\User;
use App\Models\AdditionalLearningResource;

class AdditionalLearningResourcePolicy
{
    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AdditionalLearningResource $resource): bool
    {
        return $user->id === $resource->created_by;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AdditionalLearningResource $resource): bool
    {
        return $user->id === $resource->created_by;
    }
}
