<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SessionController extends Controller
{
    /**
     * List the user's sessions from the framework `sessions` table
     * (next-sanctum `DeviceSession` contract, newest activity first).
     */
    public function index(Request $request)
    {
        abort_unless(
            config('session.driver') === 'database',
            500,
            'Device sessions require SESSION_DRIVER=database.',
        );

        $currentId = $request->session()->getId();

        return DB::table(config('session.table', 'sessions'))
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->orderByDesc('last_activity')
            ->get(['id', 'ip_address', 'user_agent', 'last_activity'])
            ->map(fn ($session) => [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'user_agent' => $session->user_agent,
                'is_current' => $session->id === $currentId,
                'last_active_at' => Carbon::createFromTimestamp($session->last_activity)->toIso8601String(),
            ])
            ->values();
    }

    /**
     * Log out every other session (password-confirmed) — mirrors Jetstream's
     * "log out other browser sessions".
     */
    public function destroyOthers(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        // Rehash the current session's auth hash so AuthenticateSession (when
        // enabled) keeps THIS session alive while the others are invalidated.
        Auth::guard('web')->logoutOtherDevices($request->password);

        DB::table(config('session.table', 'sessions'))
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        return response()->noContent();
    }

    /**
     * Log out a single session. Scoped to the user's own rows; the current
     * session must go through the normal logout flow instead.
     */
    public function destroy(Request $request, string $id)
    {
        abort_if(
            $id === $request->session()->getId(),
            422,
            'Use logout to end the current session.',
        );

        DB::table(config('session.table', 'sessions'))
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->where('id', $id)
            ->delete();

        return response()->noContent();
    }
}
