<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->with('roles')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'nullable|string',
        ]);

        $role = $validated['role'] ?? null;

        if ($role === 'admin') {
            $user->assignRole('admin');
        } else {
            if ($user->hasRole('admin') && User::role('admin')->count() <= 1) {
                return redirect()
                    ->back()
                    ->withErrors(['user' => 'Tidak bisa mencabut role admin terakhir.']);
            }

            // remove admin role if present
            if ($user->hasRole('admin')) {
                $user->removeRole('admin');
            }
        }

        return redirect()->back()->with('success', 'User updated.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()
                ->back()
                ->withErrors(['user' => 'Admin tidak bisa menghapus akun sendiri.']);
        }

        if ($user->hasRole('admin') && User::role('admin')->count() <= 1) {
            return redirect()
                ->back()
                ->withErrors(['user' => 'Tidak bisa menghapus admin terakhir.']);
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted.');
    }
}
