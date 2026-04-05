<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        // Store the intended role in session if provided
        if (request()->has('role')) {
            session(['google_auth_role' => request()->query('role')]);
        }

        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // Update existing user with Google data if needed
            $user->update([
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        } else {
            // Create new user with role from session or default to student
            $role = session('google_auth_role', 'student');

            // Validate role
            if (!in_array($role, ['student', 'teacher', 'administrator'])) {
                $role = 'student';
            }

            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => now(),
                'password' => bcrypt(str()->random(24)),
                'role' => $role,
            ]);
        }

        // Clear the role from session
        session()->forget('google_auth_role');

        Auth::login($user);

        return redirect()->intended(route('dashboard'));
    }
}
