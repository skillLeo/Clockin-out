<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BrandingSetting extends Model
{
    protected $fillable = [
        'app_name',
        'app_tagline',
        'logo_initial',
        'logo_path',
        'logo_size',
        'login_intro_heading',
        'login_intro_body',
        'login_intro_note',
        'login_heading',
        'login_sub',
        'email_label',
        'email_placeholder',
        'password_label',
        'password_placeholder',
        'remember_label',
        'login_button_text',
        'support_email',
        'footer_note',
        'primary_color',
        'sidebar_bg',
    ];

    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? \Illuminate\Support\Facades\Storage::url($this->logo_path) : null;
    }
}
