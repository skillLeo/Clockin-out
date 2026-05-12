<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_settings', function (Blueprint $table) {
            $table->id();
            $table->json('sections');
            $table->json('section_order');
            $table->enum('summary_length', ['short', 'medium'])->default('short');
            $table->string('tone', 100)->default('neutral');
            $table->text('cleaning_rules')->nullable();
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_settings');
    }
};
