<?php
/**
 * API - Create Category
 */

require_once __DIR__ . '/../config.php';

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Méthode non autorisée', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['name']) || empty($input['name'])) {
    jsonError('Nom requis', 400);
}

try {
    global $pdo;
    
    $name = sanitize($input['name']);
    $description = sanitize($input['description'] ?? '');
    
    $sql = "INSERT INTO categories (name, description, created_by) VALUES (:name, :description, :created_by)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name' => $name,
        ':description' => $description,
        ':created_by' => $_SESSION['user_id']
    ]);
    
    $category_id = $pdo->lastInsertId();
    logAction('category_create', "name=$name", 'success');
    
    jsonSuccess(['id' => $category_id], 'Catégorie créée avec succès');
    
} catch (Exception $e) {
    logError('categories_create: ' . $e->getMessage());
    jsonError('Erreur lors de la création de la catégorie', 500);
}

?>
