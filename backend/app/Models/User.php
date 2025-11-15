<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;
    
    protected $table = 'users';

    protected $fillable = [
        'nombre',
        'apellidos',
        'email',
        'password',
        'rol',
        'direccion',
        'ciudad',
        'provincia',
        'cp',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }
}
