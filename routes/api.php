<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\PasskeyController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
| API routes — protected by the Sanctum guard.
|
| Requests from the first-party Next.js SPA are authenticated statefully via the
| session cookie (see `statefulApi()` in bootstrap/app.php); third-party / mobile
| clients may instead send an `Authorization: Bearer <token>` header. The Next app
| reaches these through the same-origin proxy (next-sanctum `createSanctumRouteProxy`),
| which forwards Origin/Referer so Sanctum recognises the SPA as stateful.
*/

Route::middleware('auth:sanctum')->group(function () {
    // The authenticated user — consumed by next-sanctum `getUser()` / `useUser()`.
    // Controllers (not closures) throughout so `php artisan route:cache` works.
    Route::get('/user', [UserController::class, 'show']);

    // Account deletion (password-confirmed) — consumed by the delete-user dialog.
    Route::delete('/account', [AccountController::class, 'destroy']);

    // The user's passkeys — consumed by manage-passkeys.
    Route::get('/passkeys', [PasskeyController::class, 'index']);

    // Device sessions over the framework `sessions` table (SESSION_DRIVER=database)
    // — consumed by next-sanctum `useSessions()` (manage-sessions).
    // `/others` must be registered before the `{id}` wildcard.
    Route::get('/sessions', [SessionController::class, 'index']);
    Route::delete('/sessions/others', [SessionController::class, 'destroyOthers']);
    Route::delete('/sessions/{id}', [SessionController::class, 'destroy']);
});
