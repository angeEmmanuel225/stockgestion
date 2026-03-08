<?php
/**
 * API - Get Materials List
 */

require_once __DIR__ . '/../config.php';

requireAuth();

try {
    global $pdo;
    
    $sql = "SELECT m.id, m.code, m.name, m.description, m.current_stock, m.min_stock, m.max_stock, 
                   m.unit_price, m.supplier, m.category_id, c.name as category_name, u.id as unit_id, 
                   u.abbreviation as unit, m.created_at
            FROM materials m
            LEFT JOIN categories c ON m.category_id = c.id
            LEFT JOIN units u ON m.unit_id = u.id
            WHERE m.is_active = 1 AND m.deleted_at IS NULL
            ORDER BY m.name ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $materials = $stmt->fetchAll();
    
    jsonSuccess($materials);
} catch (Exception $e) {
    logError('materials_list: ' . $e->getMessage());
    jsonError('Erreur lors de la récupération des matières', 500);
}

?>
