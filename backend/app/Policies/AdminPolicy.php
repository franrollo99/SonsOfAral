<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class AdminPolicy
{
    public function manageContent(User $user): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('No tienes permisos para realizar esta acción.');
    }
}
