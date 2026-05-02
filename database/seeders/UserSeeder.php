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
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('admin123'),
            'role' => User::ROLE_ADMINISTRATOR,
        ]);

        User::factory()->create([
            'name' => 'Razak',
            'email' => 'razak@gmail.com',
            'password' => bcrypt('razak12345'),
            'role' => User::ROLE_TEACHER,
        ]);

        User::factory()->create([
            'name' => 'Ahmad',
            'email' => 'ahmad@gmail.com',
            'password' => bcrypt('ahmad123'),
            'role' => User::ROLE_STUDENT,
        ]);

        //Create more users using factories
        // User::factory()->teacher()->count(3)->create();
        // User::factory()->administrator()->count(1)->create();
        // User::factory()->student()->count(8)->create();
    }
}
