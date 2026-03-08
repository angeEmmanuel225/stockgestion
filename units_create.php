<?php
/**
 * API - Create Unit
 */

require_once __DIR__ . '/../config.php';

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Méthode non autorisée', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['name']) || empty($input['name']) || !isset($input['abbreviation']) || empty($input['abbreviation'])) {
    jsonError('Nom et abréviation requis', 400);
}

try {
    global $pdo;
    
    $name = sanitize($input['name']);
    $abbreviation = sanitize($input['abbreviation']);
    
    $sql = "INSERT INTO units (name, abbreviation, created_by) VALUES (:name, :abbreviation, :created_by)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name' => $name,
        ':abbreviation' => $abbreviation,
        ':created_by' => $_SESSION['user_id']
    ]);
    
    $unit_id = $pdo->lastInsertId();
    logAction('unit_create', "name=$name", 'success');
    
    jsonSuccess(['id' => $unit_id], 'Unité créée avec succès');
    
} catch (Exception $e) {
    logError('units_create: ' . $e->getMessage());
    jsonError('Erreur lors de la création de l\'unité', 500);
}

?>
