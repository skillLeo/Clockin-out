<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('individual_id')->constrained('individuals')->restrictOnDelete();
            $table->foreignId('service_id')->constrained('services')->restrictOnDelete();
            $table->foreignId('assignment_id')->constrained('assignments')->restrictOnDelete();

            $table->timestamp('clock_in_time');
            $table->decimal('clock_in_lat', 10, 8)->nullable();
            $table->decimal('clock_in_lng', 11, 8)->nullable();

            $table->timestamp('clock_out_time')->nullable();
            $table->decimal('clock_out_lat', 10, 8)->nullable();
            $table->decimal('clock_out_lng', 11, 8)->nullable();

            $table->decimal('total_hours_raw', 8, 4)->nullable();
            $table->decimal('total_hours_rounded', 8, 2)->nullable();
            $table->integer('total_units')->nullable();

            $table->text('note_staff_raw')->nullable();
            $table->text('note_ai_cleaned')->nullable();
            $table->text('note_ai_summary')->nullable();

            $table->enum('status', ['draft', 'pending_admin', 'approved', 'rejected'])->default('draft');
            $table->text('admin_comment')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
