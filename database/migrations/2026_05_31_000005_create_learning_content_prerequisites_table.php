<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('learning_content_prerequisites')) {
            Schema::drop('learning_content_prerequisites');
        }

        Schema::create('learning_content_prerequisites', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('learning_content_id');
            $table->unsignedBigInteger('prerequisite_learning_content_id');
            $table->timestamps();

            $table->unique([
                'learning_content_id',
                'prerequisite_learning_content_id',
            ], 'lcp_unique_content_prerequisite');

            // Some DB drivers don't support Blueprint::check — enforce self-reference
            // rules at the application level. Add indexes for performance.
            $table->index('learning_content_id', 'lcp_content_idx');
            $table->index('prerequisite_learning_content_id', 'lcp_prereq_idx');

            // Short, explicit FK names to avoid MySQL identifier length limits
            $table->foreign('learning_content_id', 'lcp_content_fk')
                ->references('id')
                ->on('learning_contents')
                ->onDelete('cascade');

            $table->foreign('prerequisite_learning_content_id', 'lcp_prereq_fk')
                ->references('id')
                ->on('learning_contents')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_content_prerequisites');
    }
};
