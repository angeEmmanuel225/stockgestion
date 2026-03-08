<?php
/**
 * API - Create Material
 */

require_once __DIR__ . '/../config.php';

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Méthode non autorisée', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['code']) || !isset($input['name'])) {
    jsonError('Code et nom requis', 400);
}

try {
    global $pdo;
    
    $code = sanitize($input['code']);
    $name = sanitize($input['name']);
    $description = sanitize($input['description'] ?? '');
    $category_id = isset($input['category_id']) ? (int)$input['category_id'] : null;
    $unit_id = isset($input['unit_id']) ? (int)$input['unit_id'] : null;
    $current_stock = (int)($input['current_stock'] ?? 0);
    $min_stock = (int)($input['min_stock'] ?? 10);
    $max_stock = (int)($input['max_stock'] ?? 100);
    $unit_price = (float)($input['unit_price'] ?? 0);
    $supplier = sanitize($input['supplier'] ?? '');
    
    // Vérifier code unique
    $checkSql = "SELECT id FROM materials WHERE code = :code AND deleted_at IS NULL";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':code' => $code]);
    
    if ($checkStmt->fetch()) {
        jsonError('Code matériau déjà existant', 400);
    }
    
    // Insérer
    $insertSql = "INSERT INTO materials (code, name, description, category_id, unit_id, current_stock, min_stock, max_stock, unit_price, supplier, created_by)
                  VALUES (:code, :name, :description, :category_id, :unit_id, :current_stock, :min_stock, :max_stock, :unit_price, :supplier, :created_by)";
    
    $insertStmt = $pdo->prepare($insertSql);
    $insertStmt->execute([
        ':code' => $code,
        ':name' => $name,
        ':description' => $description,
        ':category_id' => $category_id,
        ':unit_id' => $unit_id,
        ':current_stock' => $current_stock,
        ':min_stock' => $min_stock,
        ':max_stock' => $max_stock,
        ':unit_price' => $unit_price,
        ':supplier' => $supplier,
        ':created_by' => $_SESSION['user_id']
    ]);
    
    $material_id = $pdo->lastInsertId();
    logAction('material_create', "code=$code", 'success');
    
    jsonSuccess(['id' => $material_id], 'Matériau créé avec succès');
    
} catch (Exception $e) {
    logError('materials_create: ' . $e->getMessage());
    jsonError('Erreur lors de la création du matériau', 500);
}

?>
