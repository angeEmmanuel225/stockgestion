<?php
/**
 * API Logout - StockPro
 * Endpoint: POST /backend/php/api/logout.php
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../Auth.php';

// Vérifier authentification
requireAuth();

// Vérifier la méthode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    jsonError('Méthode non autorisée');
}

// Déconnexion
$result = $auth->logout();

jsonSuccess(null, 'Déconnexion réussie');

?>
