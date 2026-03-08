<?php
/**
 * API Session - StockPro
 * Endpoint: GET /backend/php/api/session.php
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../Auth.php';

// Vérifier la méthode GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    jsonError('Méthode non autorisée');
}

// Vérifier la session
$result = $auth->checkSession();

if ($result['success']) {
    jsonSuccess($result['user'], 'Authentifié');
} else {
    jsonError('Non authentifié', 401);
}

?>
