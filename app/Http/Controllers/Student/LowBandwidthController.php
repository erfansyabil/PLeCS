<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LowBandwidthController extends Controller
{
    public function toggle(Request $request)
    {
        $user = $request->user();
        $user->low_bandwidth_mode = !$user->low_bandwidth_mode;
        $user->save();

        return back();
    }
}
