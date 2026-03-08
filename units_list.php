<?php
/**
 * API - Get Units List
 */

require_once __DIR__ . '/../config.php';

requireAuth();

try {
    global $pdo;
    
    $sql = "SELECT id, name, abbreviation, description, created_at FROM units WHERE is_active = 1 ORDER BY name ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $units = $stmt->fetchAll();
    
    jsonSuccess($units);
} catch (Exception $e) {
    logError('units_list: ' . $e->getMessage());
    jsonError('Erreur lors de la récupération des unités', 500);
}

?>
