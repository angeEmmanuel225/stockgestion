<?php
/**
 * API - Get Alerts
 * Filtre selon le type d'utilisateur (démo vs réel)
 */

require_once __DIR__ . '/../config.php';

requireAuth();

// Récupérer l'utilisateur courant
$current_user_id = $_SESSION['user_id'] ?? null;
if (!$current_user_id) {
    jsonError('Non authentifié', 401);
}

try {
    global $pdo;
    
    $sql = "SELECT m.id, m.code, m.name, m.current_stock, m.min_stock, m.max_stock
            FROM materials m
            WHERE m.is_active = 1 AND m.deleted_at IS NULL
            ORDER BY CASE 
                WHEN m.current_stock < (m.min_stock * 0.5) THEN 0
                WHEN m.current_stock < m.min_stock THEN 1
                ELSE 2
            END ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $materials = $stmt->fetchAll();
    
    $alerts = [];
    foreach ($materials as $mat) {
        if ($mat['current_stock'] < $mat['min_stock']) {
            $mat['severity'] = ($mat['current_stock'] < ($mat['min_stock'] * 0.5)) ? 'critical' : 'warning';
            $alerts[] = $mat;
        }
    }
    
    $critical = count(array_filter($alerts, fn($a) => $a['severity'] === 'critical'));
    $warning = count(array_filter($alerts, fn($a) => $a['severity'] === 'warning'));
    
    jsonSuccess([
        'alerts' => $alerts,
        'summary' => [
            'critical' => $critical,
            'warning' => $warning
        ]
    ], 'Alertes récupérées');
    
} catch (Exception $e) {
    logError('alerts_list: ' . $e->getMessage());
    jsonError('Erreur lors de la récupération des alertes', 500);
}

?>
