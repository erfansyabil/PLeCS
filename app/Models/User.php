<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'google_id',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Role constants
     */
    const ROLE_STUDENT = 'student';
    const ROLE_TEACHER = 'teacher';
    const ROLE_ADMINISTRATOR = 'administrator';

    /**
     * Get available roles
     *
     * @return array
     */
    public static function getRoles()
    {
        return [
            self::ROLE_STUDENT => 'Student',
            self::ROLE_TEACHER => 'Teacher',
            self::ROLE_ADMINISTRATOR => 'Administrator',
        ];
    }

    /**
     * Check if user is a student
     *
     * @return bool
     */
    public function isStudent()
    {
        return $this->role === self::ROLE_STUDENT;
    }

    /**
     * Check if user is a teacher
     *
     * @return bool
     */
    public function isTeacher()
    {
        return $this->role === self::ROLE_TEACHER;
    }

    /**
     * Check if user is an administrator
     *
     * @return bool
     */
    public function isAdministrator()
    {
        return $this->role === self::ROLE_ADMINISTRATOR;
    }

    /**
     * Check if user has a specific role
     *
     * @param string $role
     * @return bool
     */
    public function hasRole($role)
    {
        return $this->role === $role;
    }

    /**
     * Check if user has any of the given roles
     *
     * @param array $roles
     * @return bool
     */
    public function hasAnyRole(array $roles)
    {
        return in_array($this->role, $roles);
    }
}
