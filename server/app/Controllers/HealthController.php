<?php

namespace AiChef\Controllers;

use AiChef\Core\Request;
use AiChef\Core\Response;

class HealthController
{
    public function show(Request $request): Response
    {
        return Response::json([
            'status' => 'ok',
            'service' => 'AI Chef API',
            'version' => '0.2.0',
        ]);
    }
}
