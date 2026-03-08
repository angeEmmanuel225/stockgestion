<?php
/**
 * API - Get Categories List
 */

require_once __DIR__ . '/../config.php';

requireAuth();

try {
    global $pdo;
    
    $sql = "SELECT id, name, description, created_at FROM categories WHERE is_active = 1 ORDER BY name ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $categories = $stmt->fetchAll();
    
    jsonSuccess($categories);
} catch (Exception $e) {
    logError('categories_list: ' . $e->getMessage());
    jsonError('Erreur lors de la récupération des catégories', 500);
}

?>
