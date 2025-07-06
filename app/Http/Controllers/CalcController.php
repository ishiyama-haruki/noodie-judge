<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Http\Controllers\Controller;

class CalcController extends Controller
{
    public function index()
    {
        return Inertia::render('Calc');
    }
}