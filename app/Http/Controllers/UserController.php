<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        // Fetch all users, excluding the currently logged-in user if you want to prevent self-deletion
        $users = User::orderBy('name')->get();

        return Inertia::render('Users/Index', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:super admin,hr,registrar,staff'
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']), // Always encrypt passwords!
            'role' => $validated['role'],
        ]);

        return redirect()->back()->with('success', 'User account created successfully.');
    }

    public function destroy(User $user)
    {
        // Optional safety check: Prevent Super Admin from deleting themselves
        if (auth()->id() === $user->id) {
            return redirect()->back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        $user->delete();
        return redirect()->back()->with('success', 'User account deleted.');
    }
}