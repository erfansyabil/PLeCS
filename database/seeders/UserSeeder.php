<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's user data.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => User::ROLE_STUDENT,
        ]);

        User::factory()->teacher()->count(3)->create();
        User::factory()->administrator()->count(1)->create();
        User::factory()->student()->count(8)->create();
    }
}
