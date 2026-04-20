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
        Schema::create('contents', function (Blueprint $table) {
            $table->id('contentID');
            $table->foreignId('topicID')
                  ->constrained('topics', 'topicID')
                  ->onDelete('cascade');
            $table->foreignId('uploadedBy')
                  ->constrained('users', 'id')
                  ->onDelete('cascade')
                  ->comment('References User table - Admin or Teacher');
            $table->string('title', 255);
            $table->enum('format', ['Video', 'PDF', 'Article', 'Image'])
                  ->comment('Type of content format');
            $table->string('filePath', 255)
                  ->nullable()
                  ->comment('Storage path or URL of the file');
            $table->float('sizeMB', 8, 2)
                  ->default(0.00)
                  ->comment('File size in megabytes');
            $table->boolean('isLowBandwidth')
                  ->default(false)
                  ->comment('Whether content is optimized for low bandwidth mode');
            $table->boolean('isSupplementary')
                  ->default(false)
                  ->comment('False = Admin core content, True = Teacher supplementary material');
            $table->timestamps(); // creates created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content');
    }
};
