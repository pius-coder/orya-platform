<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PasskeyController extends Controller
{
    /**
     * The user's passkeys (safe columns only) — consumed by manage-passkeys.
     * (laravel/passkeys provides create/delete routes but no list route.)
     */
    public function index(Request $request)
    {
        return $request->user()
            ->passkeys()
            ->latest()
            ->get(['id', 'name', 'last_used_at', 'created_at']);
    }
}
