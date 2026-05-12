<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Individual;
use App\Models\Service;
use App\Models\Assignment;
use App\Models\AiSetting;
use App\Models\BrandingSetting;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@example.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'active'   => true,
        ]);

        $staff = User::create([
            'name'     => 'Jane Staff',
            'email'    => 'staff@example.com',
            'password' => Hash::make('password'),
            'role'     => 'staff',
            'active'   => true,
        ]);

        $alice = Individual::create(['name' => 'Alice Johnson']);
        $bob   = Individual::create(['name' => 'Bob Martinez']);

        $personal = Service::create(['name' => 'Personal Care']);
        $respite  = Service::create(['name' => 'Respite Care']);

        Assignment::create([
            'staff_id'      => $staff->id,
            'individual_id' => $alice->id,
            'service_id'    => $personal->id,
            'date'          => today()->toDateString(),
        ]);

        Assignment::create([
            'staff_id'      => $staff->id,
            'individual_id' => $bob->id,
            'service_id'    => $respite->id,
            'date'          => today()->toDateString(),
        ]);

        AiSetting::create([
            'sections'       => ['Activities', 'Participation', 'Support Provided', 'Outcomes'],
            'section_order'  => ['Activities', 'Participation', 'Support Provided', 'Outcomes'],
            'summary_length' => 'short',
            'tone'           => 'neutral',
            'cleaning_rules' => null,
        ]);

        BrandingSetting::create([
            'app_name'      => 'EVV System',
            'app_tagline'   => 'Electronic Visit Verification',
            'logo_initial'  => 'E',
            'login_intro_heading' => 'Manage EVV visits with a clear, controlled workflow.',
            'login_intro_body'    => 'Staff clock visits in and out, submit notes, and admins review records for payroll from one secure workspace.',
            'login_intro_note'    => 'Secure staff access and administrator review in one clean workspace.',
            'login_heading' => 'Sign in to your account',
            'login_sub'     => 'Enter your credentials to continue',
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
        ]);
    }
}
