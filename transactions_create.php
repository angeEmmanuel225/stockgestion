<?php
/**
 * API - Create Transaction
 */

require_once __DIR__ . '/../config.php';

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Méthode non autorisée', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['material_id']) || !isset($input['type']) || !isset($input['quantity'])) {
    jsonError('Paramètres requis manquants', 400);
}

try {
    global $pdo;
    
    $material_id = (int)$input['material_id'];
    $type = sanitize($input['type']);
    $quantity = (float)$input['quantity'];
    $reference_no = sanitize($input['reference_no'] ?? '');
    $notes = sanitize($input['notes'] ?? '');
    
    if (!in_array($type, ['entry', 'exit', 'adjustment'])) {
        jsonError('Type de transaction invalide', 400);
    }
    
    if ($quantity <= 0) {
        jsonError('Quantité doit être positive', 400);
    }
    
    // Vérifier matériau existe
    $checkSql = "SELECT id, current_stock FROM materials WHERE id = :id AND is_active = 1 AND deleted_at IS NULL";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':id' => $material_id]);
    $material = $checkStmt->fetch();
    
    if (!$material) {
        jsonError('Matériau non trouvé', 404);
    }
    
    $new_stock = $material['current_stock'];
    
    // Calculer nouveau stock
    if ($type === 'entry') {
        $new_stock += $quantity;
    } elseif ($type === 'exit') {
        if ($material['current_stock'] < $quantity) {
            jsonError('Stock insuffisant', 400);
        }
        $new_stock -= $quantity;
    } elseif ($type === 'adjustment') {
        $new_stock = $quantity;
    }
    
    // Démarrer transaction BD
    $pdo->beginTransaction();
    
    try {
        // Insérer transaction
        $insertSql = "INSERT INTO transactions (material_id, type, quantity, reference_no, notes, created_by)
                      VALUES (:material_id, :type, :quantity, :reference_no, :notes, :created_by)";
        $insertStmt = $pdo->prepare($insertSql);
        $insertStmt->execute([
            ':material_id' => $material_id,
            ':type' => $type,
            ':quantity' => $quantity,
            ':reference_no' => $reference_no,
            ':notes' => $notes,
            ':created_by' => $_SESSION['user_id']
        ]);
        
        $tx_id = $pdo->lastInsertId();
        
        // Mettre à jour stock
        $updateSql = "UPDATE materials SET current_stock = :stock WHERE id = :id";
        $updateStmt = $pdo->prepare($updateSql);
        $updateStmt->execute([
            ':stock' => $new_stock,
            ':id' => $material_id
        ]);
        
        $pdo->commit();
        
        logAction('transaction_create', "type=$type material=$material_id qty=$quantity", 'success');
        jsonSuccess(['id' => $tx_id, 'new_stock' => $new_stock], 'Transaction créée avec succès');
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    logError('transactions_create: ' . $e->getMessage());
    jsonError('Erreur lors de la création de la transaction', 500);
}

?>
