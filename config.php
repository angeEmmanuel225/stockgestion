<?php
/**
 * StockPro - Database Configuration and Connection
 * Secure MySQL connection management
 * NOTE: For production, use environment variables or a secure config file
 */

// Database configuration - Use environment variables in production
define('DB_HOST', getenv('DB_HOST') ?: 'sql306.infinityfree.com');
define('DB_PORT', getenv('DB_PORT') ?: 3306);
define('DB_USER', getenv('DB_USER') ?: 'if0_41298496');
define('DB_PASS', getenv('DB_PASS') ?: 'ZUulcenvlOPEL');
define('DB_NAME', getenv('DB_NAME') ?: 'if0_41298496_stockprodb0007');
define('DB_CHARSET', 'utf8mb4');

// Security configuration
define('SESSION_TIMEOUT', 3600); // 1 hour
define('PASSWORD_MIN_LENGTH', 8);
define('CORS_ENABLED', true);
$allowed_origins = ['http://localhost', 'http://localhost:8000', 'http://127.0.0.1', 'http://localhost:3000'];
define('ALLOWED_ORIGINS', implode(',', $allowed_origins));

// Configuration des logs
define('LOG_PATH', __DIR__ . '/../../logs/');
define('LOG_ERRORS', true);

// Démarrer la session de manière sécurisée
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => SESSION_TIMEOUT,
        'path' => '/',
        'secure' => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
    session_start();
}

// Security headers and CORS
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// CORS headers - Use environment variable in production
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Vérifier le timeout de session
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_TIMEOUT) {
    session_destroy();
    $_SESSION = [];
    http_response_code(401);
    die(json_encode(['success' => false, 'error' => 'Session expirée']));
}
$_SESSION['last_activity'] = time();

/**
 * Connexion PDO à la base de données
 */
function getPDOConnection() {
    try {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        logError('Erreur connexion BD: ' . $e->getMessage());
        http_response_code(500);
        die(json_encode(['success' => false, 'error' => 'Erreur serveur']));
    }
}

// Instance PDO globale
$pdo = getPDOConnection();

/**
 * Wrapper PDO compatible avec les appels MySQLi
 * Permet la rétro-compatibilité avec le code existant
 */
class PDOWrapper {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function query($sql) {
        try {
            return $this->pdo->query($sql);
        } catch (PDOException $e) {
            return false;
        }
    }
    
    public function prepare($sql) {
        try {
            return $this->pdo->prepare($sql);
        } catch (PDOException $e) {
            return false;
        }
    }
    
    public function escape_string($str) {
        return addslashes($str);
    }
    
    public function real_escape_string($str) {
        return addslashes($str);
    }
}

/**
 * Fonction de rétro-compatibilité pour getDBConnection()
 */
function getDBConnection() {
    global $pdo;
    return new PDOWrapper($pdo);
}

/**
 * Sanitation des inputs
 */
function sanitize($input) {
    if (is_array($input)) {
        foreach ($input as $key => $value) {
            $input[$key] = sanitize($value);
        }
        return $input;
    }
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validation email
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validation mot de passe
 */
function isValidPassword($password) {
    return strlen($password) >= PASSWORD_MIN_LENGTH;
}

/**
 * Hash mot de passe
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

/**
 * Vérifier mot de passe
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Logger les actions de sécurité
 */
function logAction($action, $resource, $result = 'success') {
    global $pdo;
    try {
        $user_id = $_SESSION['user_id'] ?? null;
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        
        $sql = 'INSERT INTO security_logs (user_id, action, resource, ip_address, result) 
                VALUES (:user_id, :action, :resource, :ip, :result)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':user_id' => $user_id,
            ':action' => $action,
            ':resource' => $resource,
            ':ip' => $ip,
            ':result' => $result,
        ]);
    } catch (Exception $e) {
        // Silencieusement échouer sur log
    }
}

/**
 * Logging des erreurs
 */
function logError($message, $level = 'ERROR') {
    if (!LOG_ERRORS) return;
    
    $log_file = LOG_PATH . 'error.log';
    
    if (!is_dir(LOG_PATH)) {
        mkdir(LOG_PATH, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $log_message = "[$timestamp] [$level] [$ip] $message\n";
    
    error_log($log_message, 3, $log_file);
}

/**
 * Répondre en JSON avec erreur
 */
function jsonError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

/**
 * Répondre en JSON avec succès
 */
function jsonSuccess($data = null, $message = null) {
    $response = ['success' => true];
    if ($message) $response['message'] = $message;
    if ($data) $response['data'] = $data;
    echo json_encode($response);
    exit;
}

// Vérifier authentification
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        jsonError('Non authentifié', 401);
    }
}

// Vérifier rôle (correspondent aux rôles JS: DG, TECH, STOCK)
function requireRole($required_roles) {
    requireAuth();
    
    if (!is_array($required_roles)) {
        $required_roles = [$required_roles];
    }
    
    if (!in_array($_SESSION['user_role'] ?? null, $required_roles)) {
        jsonError('Accès refusé', 403);
    }
}

?>
