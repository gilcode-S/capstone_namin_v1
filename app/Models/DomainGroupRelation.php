<?php

namespace App\Models;
use App\Models\DomainGroup;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DomainGroupRelation extends Model
{
    use HasFactory;

    /**
     * TABLE NAME
     * Explicitly defines the table used by this model.
     */
    protected $table = 'domain_group_relations';

    /**
     * MASS ASSIGNABLE FIELDS
     * These are the fields allowed for bulk insert/update.
     */
    protected $fillable = [

        // FIRST DOMAIN GROUP (e.g. Computer Studies / IT)
        'domain_group_a',

        // SECOND DOMAIN GROUP (e.g. Engineering, Business, etc.)
        'domain_group_b',

        // RELATION SCORE (0.0 - 1.0)
        // used by CP-SAT for cross-domain competency weighting
        'score',
    ];

    /**
     * RELATION TO FIRST DOMAIN GROUP
     */
    public function domainGroupA()
    {
        return $this->belongsTo(DomainGroup::class, 'domain_a');
    }

    /**
     * RELATION TO SECOND DOMAIN GROUP
     */
    public function domainGroupB()
    {
        return $this->belongsTo(DomainGroup::class, 'domain_b');
    }
}


