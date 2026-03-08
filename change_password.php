<?php
/**
 * API - Change Password
 * Endpoint: POST /backend/php/api/change_password.php
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

// Récupérer les données
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['old_password']) || empty($input['new_password'])) {
    jsonError('Ancien et nouveau mot de passe requis', 400);
}

// Changer le mot de passe
$user_id = $_SESSION['user_id'];
$result = $auth->changePassword($user_id, $input['old_password'], $input['new_password']);

if ($result['success']) {
    jsonSuccess(null, $result['message']);
} else {
    jsonError($result['error'], 400);
}
?>
