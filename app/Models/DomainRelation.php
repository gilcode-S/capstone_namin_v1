<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DomainRelation extends Model
{
    protected $table = 'domain_relations';

    protected $fillable = [
        'domain_a',
        'domain_b',
        'score',
    ];

    /**
     * Optional: Scope to get relation between two domains
     */
    public function scopeBetween($query, $domainA, $domainB)
    {
        return $query->where(function ($q) use ($domainA, $domainB) {
            $q->where('domain_a', $domainA)
              ->where('domain_b', $domainB);
        })->orWhere(function ($q) use ($domainA, $domainB) {
            $q->where('domain_a', $domainB)
              ->where('domain_b', $domainA);
        });
    }

    /**
     * Optional: Check similarity score between domains
     */
    public static function getScore($domainA, $domainB)
    {
        $relation = self::between($domainA, $domainB)->first();
        return $relation ? $relation->score : 0;
    }
}