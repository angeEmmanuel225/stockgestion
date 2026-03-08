<?php
/**
 * API - Get Material Detail
 */

require_once __DIR__ . '/../config.php';

requireAuth();

if (!isset($_GET['id'])) {
    jsonError('ID matériau requis', 400);
}

try {
    global $pdo;
    
    $id = (int)$_GET['id'];
    
    $sql = "SELECT m.id, m.code, m.name, m.description, m.current_stock, m.min_stock, m.max_stock, 
                   m.unit_price, m.supplier, m.category_id, c.name as category_name, u.id as unit_id, 
                   u.abbreviation as unit
            FROM materials m
            LEFT JOIN categories c ON m.category_id = c.id
            LEFT JOIN units u ON m.unit_id = u.id
            WHERE m.id = :id AND m.is_active = 1 AND m.deleted_at IS NULL";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    $material = $stmt->fetch();
    
    if (!$material) {
        jsonError('Matériau non trouvé', 404);
    }
    
    // Historique récent (30 dernières transactions)
    $history_sql = "SELECT id, type, quantity, reference_no, created_at
                    FROM transactions
                    WHERE material_id = :material_id AND deleted_at IS NULL
                    ORDER BY created_at DESC
                    LIMIT 30";
    
    $history_stmt = $pdo->prepare($history_sql);
    $history_stmt->execute([':material_id' => $id]);
    $history = $history_stmt->fetchAll();
    
    jsonSuccess(['material' => $material, 'history' => $history], 'Matériau récupéré avec succès');
    
} catch (Exception $e) {
    logError('materials_detail: ' . $e->getMessage());
    jsonError('Erreur lors de la récupération du matériau', 500);
}

?>
