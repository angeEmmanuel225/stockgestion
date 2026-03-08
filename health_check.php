<?php
/**
 * StockPro - Health Check
 * Vérifier la configuration complète
 */

header('Content-Type: application/json; charset=utf-8');

$checks = [
    'PHP Version' => [
        'required' => '7.4',
        'actual' => phpversion(),
        'pass' => version_compare(phpversion(), '7.4', '>=')
    ],
    'PHP Extensions' => [
        'pdo' => extension_loaded('pdo'),
        'pdo_mysql' => extension_loaded('pdo_mysql'),
        'json' => extension_loaded('json'),
        'mbstring' => extension_loaded('mbstring'),
        'curl' => extension_loaded('curl')
    ],
    'File Permissions' => [
        'logs' => [
            'path' => __DIR__ . '/../../logs/',
            'readable' => is_readable(__DIR__ . '/../../logs/'),
            'writable' => is_writable(__DIR__ . '/../../logs/')
        ],
        'backend' => [
            'path' => __DIR__ . '/../../backend/',
            'readable' => is_readable(__DIR__ . '/../../backend/')
        ],
        'assets' => [
            'path' => __DIR__ . '/../../assets/',
            'readable' => is_readable(__DIR__ . '/../../assets/')
        ]
    ],
    'Configuration Files' => [
        'config.php' => file_exists(__DIR__ . '/../config.php'),
        'Auth.php' => file_exists(__DIR__ . '/../Auth.php'),
        'database.sql' => file_exists(__DIR__ . '/../../backend/sql/database.sql'),
        'script.js' => file_exists(__DIR__ . '/../../assets/js/script.js'),
        'style.css' => file_exists(__DIR__ . '/../../assets/css/style.css')
    ]
];

// Test de connexion MySQL
$db_ok = false;
$db_error = '';

try {
    require_once __DIR__ . '/../config.php';
    $pdo = getPDOConnection();
    
    // Test des tables
    $tables = $pdo->query("SHOW TABLES FROM stockpro")->fetchAll();
    
    $checks['Database'] = [
        'connected' => true,
        'tables_count' => count($tables),
        'tables' => ['users', 'categories', 'units', 'materials', 'transactions', 'alerts', 'security_logs'],
    ];
    
    $db_ok = true;
} catch (Exception $e) {
    $checks['Database'] = [
        'connected' => false,
        'error' => $e->getMessage()
    ];
}

// Résumé
$all_pass = true;
foreach ($checks as $check) {
    if (is_bool($check) && !$check) {
        $all_pass = false;
    } elseif (is_array($check)) {
        foreach ($check as $key => $val) {
            if (is_bool($val) && !$val) {
                $all_pass = false;
            }
        }
    }
}

$response = [
    'status' => $all_pass ? 'OK' : 'ERROR',
    'timestamp' => date('Y-m-d H:i:s'),
    'checks' => $checks
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

?>
