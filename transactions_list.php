<?php
/**
 * API - Get Transactions List
 */

require_once __DIR__ . '/../config.php';

requireAuth();

try {
    global $pdo;
    
    $type = isset($_GET['type']) ? sanitize($_GET['type']) : null;
    $material_id = isset($_GET['material_id']) ? (int)$_GET['material_id'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    
    $sql = "SELECT t.id, t.material_id, t.type, t.quantity, t.reference_no, t.notes, t.created_by,
                   t.created_at, m.name as material_name, m.code
            FROM transactions t
            LEFT JOIN materials m ON t.material_id = m.id
            WHERE t.deleted_at IS NULL";
    
    $params = [];
    
    if ($type) {
        $sql .= " AND t.type = :type";
        $params[':type'] = $type;
    }
    
    if ($material_id) {
        $sql .= " AND t.material_id = :material_id";
        $params[':material_id'] = $material_id;
    }
    
    $sql .= " ORDER BY t.created_at DESC LIMIT :limit";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $transactions = $stmt->fetchAll();
    
    jsonSuccess($transactions);
    
} catch (Exception $e) {
    logError('transactions_list: ' . $e->getMessage());
    jsonError('Erreur lors de la récupération des transactions', 500);
}

?>
