<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BrandingSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BrandingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Branding', [
            'settings' => BrandingSetting::first(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_name'            => 'required|string|max:80',
            'app_tagline'         => 'nullable|string|max:150',
            'login_intro_heading' => 'nullable|string|max:160',
            'login_intro_body'    => 'nullable|string|max:500',
            'login_intro_note'    => 'nullable|string|max:200',
            'login_heading' => 'required|string|max:100',
            'login_sub'     => 'nullable|string|max:200',
            'email_label' => 'required|string|max:80',
            'email_placeholder' => 'required|string|max:120',
            'password_label' => 'required|string|max:80',
            'password_placeholder' => 'required|string|max:120',
            'remember_label' => 'required|string|max:120',
            'login_button_text' => 'required|string|max:80',
            'support_email' => 'nullable|email|max:150',
            'footer_note'   => 'nullable|string|max:200',
            'primary_color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'sidebar_bg'    => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'logo_size'     => 'nullable|integer|min:24|max:120',
        ]);

        $setting = BrandingSetting::firstOrNew([]);
        $setting->fill($validated)->save();

        return response()->json(['ok' => true]);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate(['logo' => 'required|image|mimes:png,jpg,jpeg,gif,svg|max:2048']);

        $setting = BrandingSetting::firstOrNew([]);

        if ($setting->logo_path) {
            Storage::disk('public')->delete($setting->logo_path);
        }

        $path = $request->file('logo')->store('logos', 'public');
        $setting->logo_path = $path;
        $setting->save();

        return response()->json(['logo_url' => Storage::url($path)]);
    }

    public function removeLogo(): JsonResponse
    {
        $setting = BrandingSetting::first();

        if ($setting && $setting->logo_path) {
            Storage::disk('public')->delete($setting->logo_path);
            $setting->update(['logo_path' => null]);
        }

        return response()->json(['ok' => true]);
    }
}
