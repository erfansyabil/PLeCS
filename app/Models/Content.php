<?php

namespace App\Models;

use Database\Factories\ContentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Content extends Model
{
    /** @use HasFactory<ContentFactory> */
    use HasFactory;

    protected $table = 'contents';

    protected $primaryKey = 'contentID';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'topicID',
        'uploadedBy',
        'title',
        'format',
        'filePath',
        'sizeMB',
        'isLowBandwidth',
        'isSupplementary',
    ];

    protected $casts = [
        'sizeMB' => 'float',
        'isLowBandwidth' => 'boolean',
        'isSupplementary' => 'boolean',
    ];

    /**
     * Topic this content belongs to.
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo('App\\Models\\Topic', 'topicID', 'topicID');
    }

    /**
     * User who uploaded this content.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploadedBy', 'id');
    }
}
