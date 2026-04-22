<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AuditLog extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'user_id',
        'user_name',
        'role',
        'action',
        'module',
        'description',
        'old_data',
        'new_data',
        'is_restorable',
        'created_at'
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
        'is_restorable' => 'boolean',
        'created_at' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
        });
    }
}
