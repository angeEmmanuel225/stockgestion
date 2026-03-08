<?php
/**
 * API - Delete Category
 */

require_once __DIR__ . '/../config.php';

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Méthode non autorisée', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    jsonError('ID requis', 400);
}

try {
    global $pdo;
    
    $id = (int)$input['id'];
    
    // Soft delete - marquer comme supprimé
    $sql = "UPDATE categories SET deleted_at = CURRENT_TIMESTAMP WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    
    logAction('category_delete', "id=$id", 'success');
    jsonSuccess(['deleted' => true], 'Catégorie supprimée avec succès');
    
} catch (Exception $e) {
    logError('categories_delete: ' . $e->getMessage());
    jsonError('Erreur lors de la suppression de la catégorie', 500);
}

?>
