<?php
/**
 * API - Delete Transaction
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
    
    // Récupérer la transaction
    $sql = "SELECT material_id, quantity, type FROM transactions WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    $transaction = $stmt->fetch();
    
    if (!$transaction) {
        jsonError('Transaction non trouvée', 404);
    }
    
    // Inverser le mouvement
    $sign = ($transaction['type'] === 'entry') ? -1 : 1;
    $new_quantity = $sign * $transaction['quantity'];
    
    // Soft delete - marquer comme supprimée
    $sql = "UPDATE transactions SET deleted_at = CURRENT_TIMESTAMP WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    
    // Mettre à jour le stock
    $sql = "UPDATE materials SET current_stock = current_stock + :qty WHERE id = :material_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':qty' => $new_quantity, ':material_id' => $transaction['material_id']]);
    
    logAction('transaction_delete', "id=$id", 'success');
    jsonSuccess(['deleted' => true], 'Transaction supprimée avec succès');
    
} catch (Exception $e) {
    logError('transactions_delete: ' . $e->getMessage());
    jsonError('Erreur lors de la suppression de la transaction', 500);
}
?>
