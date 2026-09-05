<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * The authenticated user — consumed by next-sanctum `getUser()` / `useUser()`.
     */
    public function show(Request $request)
    {
        return $request->user();
    }
}
