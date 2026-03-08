<?php
/**
 * API Login - StockPro
 * Endpoint: POST /backend/php/api/login.php
 * Authentification par user_id + password
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../Auth.php';

// Vérifier la méthode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    jsonError('Méthode non autorisée');
}

// Récupérer les données JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    jsonError('Données JSON invalides', 400);
}

// Valider les paramètres
if (empty($input['user_id']) || empty($input['password'])) {
    jsonError('Identifiant et mot de passe requis', 400);
}

// Authentification
$result = $auth->login($input['user_id'], $input['password']);

if ($result['success']) {
    jsonSuccess([
        'success' => true,
        'user' => $result['user'],
        'message' => 'Connexion réussie'
    ], 'Connexion réussie');
} else {
    http_response_code(401);
    jsonError($result['error'], 401);
}

?>
