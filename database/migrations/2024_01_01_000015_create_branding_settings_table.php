<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branding_settings', function (Blueprint $table) {
            $table->id();
            $table->string('app_name')->default('EVV System');
            $table->string('app_tagline')->nullable();
            $table->string('logo_initial', 2)->default('E');
            $table->string('login_intro_heading')->default('Manage EVV visits with a clear, controlled workflow.');
            $table->text('login_intro_body')->nullable();
            $table->string('login_intro_note', 300)->nullable();
            $table->string('login_heading')->default('Sign in to your account');
            $table->string('login_sub')->nullable();
            $table->string('email_label')->default('Email address');
            $table->string('email_placeholder')->default('you@example.com');
            $table->string('password_label')->default('Password');
            $table->string('password_placeholder')->default('Password');
            $table->string('remember_label')->default('Keep me signed in');
            $table->string('login_button_text')->default('Sign in');
            $table->string('support_email')->nullable();
            $table->string('footer_note')->nullable();
            $table->string('primary_color', 7)->default('#1e293b');
            $table->string('sidebar_bg', 7)->default('#0f172a');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branding_settings');
    }
};
