<?php

namespace App\Http\Middleware;

use App\Models\BrandingSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'branding' => fn () => BrandingSetting::first() ?? [
                'app_name'      => 'EVV System',
                'app_tagline'   => 'Electronic Visit Verification',
                'logo_initial'  => 'E',
                'login_intro_heading' => 'Manage EVV visits with a clear, controlled workflow.',
                'login_intro_body'    => 'Staff clock visits in and out, submit notes, and admins review records for payroll from one secure workspace.',
                'login_intro_note'    => 'Secure staff access and administrator review in one clean workspace.',
                'login_heading' => 'Sign in to your account',
                'login_sub'     => null,
                'email_label' => 'Email address',
                'email_placeholder' => 'you@example.com',
                'password_label' => 'Password',
                'password_placeholder' => 'Password',
                'remember_label' => 'Keep me signed in',
                'login_button_text' => 'Sign in',
                'support_email' => null,
                'footer_note'   => null,
                'primary_color' => '#1e293b',
                'sidebar_bg'    => '#0f172a',
            ],
        ];
    }
}
