<?php
/**
 * StockPro - Authentification
 * Gestion des utilisateurs et sessions
 * Correspond aux identifiants du code JS (constants.js)
 */

require_once __DIR__ . '/config.php';

class Auth {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * Connexion utilisateur
     * Accepte les mots de passe hachés (bcrypt) ou en clair (démo)
     */
    public function login($user_id, $password) {
        try {
            $user_id = sanitize($user_id);
            
            // Rechercher l'utilisateur
            $sql = 'SELECT * FROM users WHERE user_id = :user_id AND is_active = 1 LIMIT 1';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':user_id' => $user_id]);
            $user = $stmt->fetch();
            
            if (!$user) {
                logAction('login_failed', "user=$user_id", 'failure');
                return ['success' => false, 'error' => 'Identifiant ou mot de passe incorrect'];
            }
            
            // Vérifier le mot de passe
            // Support des deux formats: bcrypt ($2y$...) ou texte clair (démo)
            $password_valid = false;
            if (strpos($user['password'], '$2y$') === 0) {
                // Hash bcrypt
                $password_valid = password_verify($password, $user['password']);
            } else {
                // Comparaison directe (mode démo)
                $password_valid = ($user['password'] === $password);
            }
            
            if (!$password_valid) {
                logAction('login_failed', "user=$user_id", 'failure');
                return ['success' => false, 'error' => 'Identifiant ou mot de passe incorrect'];
            }
            
            // Créer la session
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['login_time'] = time();
            
            // Mettre à jour last_login
            $sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = :user_id';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':user_id' => $user_id]);
            
            logAction('login_success', "user=$user_id", 'success');
            
            return [
                'success' => true,
                'user' => [
                    'id' => $user['user_id'],
                    'name' => $user['name'],
                    'role' => $user['role']
                ]
            ];
            
        } catch (Exception $e) {
            logError('Erreur login: ' . $e->getMessage());
            return ['success' => false, 'error' => 'Erreur serveur'];
        }
    }
    
    /**
     * Déconnexion utilisateur
     */
    public function logout() {
        try {
            $user_id = $_SESSION['user_id'] ?? null;
            
            if ($user_id) {
                logAction('logout', "user=$user_id", 'success');
            }
            
            session_destroy();
            $_SESSION = [];
            
            return ['success' => true, 'message' => 'Déconnexion réussie'];
        } catch (Exception $e) {
            logError('Erreur logout: ' . $e->getMessage());
            return ['success' => false, 'error' => 'Erreur serveur'];
        }
    }
    
    /**
     * Vérifier la session
     */
    public function checkSession() {
        if (!isset($_SESSION['user_id'])) {
            return ['success' => false, 'authenticated' => false];
        }
        
        return [
            'success' => true,
            'authenticated' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'name' => $_SESSION['user_name'],
                'role' => $_SESSION['user_role']
            ]
        ];
    }
    
    /**
     * Changer le mot de passe
     */
    public function changePassword($user_id, $old_password, $new_password) {
        try {
            if (!isset($_SESSION['user_id'])) {
                return ['success' => false, 'error' => 'Non authentifié'];
            }
            
            // Vérifier droits
            if ($_SESSION['user_id'] !== $user_id && $_SESSION['user_role'] !== 'DG') {
                return ['success' => false, 'error' => 'Accès refusé'];
            }
            
            // Récupérer l'utilisateur
            $sql = 'SELECT * FROM users WHERE user_id = :user_id LIMIT 1';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':user_id' => $user_id]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return ['success' => false, 'error' => 'Utilisateur non trouvé'];
            }
            
            // Vérifier ancien password (supportant les deux formats)
            $old_password_valid = false;
            if (strpos($user['password'], '$2y$') === 0) {
                $old_password_valid = password_verify($old_password, $user['password']);
            } else {
                $old_password_valid = ($user['password'] === $old_password);
            }
            
            if (!$old_password_valid) {
                return ['success' => false, 'error' => 'Ancien mot de passe incorrect'];
            }
            
            // Valider nouveau password
            if (strlen($new_password) < 6) {
                return ['success' => false, 'error' => 'Le nouveau mot de passe doit faire au moins 6 caractères'];
            }
            
            // Mettre à jour
            $sql = 'UPDATE users SET password = :password WHERE user_id = :user_id';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':password' => $new_password,
                ':user_id' => $user_id
            ]);
            
            logAction('password_change', "user=$user_id", 'success');
            
            return ['success' => true, 'message' => 'Mot de passe changé avec succès'];
            
        } catch (Exception $e) {
            logError('Erreur change password: ' . $e->getMessage());
            return ['success' => false, 'error' => 'Erreur serveur'];
        }
    }
    
    /**
     * Réinitialiser password (DG uniquement)
     */
    public function resetPassword($user_id, $new_password) {
        try {
            // Vérifier que c'est un DG
            if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'DG') {
                return ['success' => false, 'error' => 'Accès refusé'];
            }
            
            if (strlen($new_password) < 6) {
                return ['success' => false, 'error' => 'Le mot de passe doit faire au moins 6 caractères'];
            }
            
            $sql = 'UPDATE users SET password = :password WHERE user_id = :user_id';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':password' => $new_password,
                ':user_id' => $user_id
            ]);
            
            logAction('password_reset', "user=$user_id", 'success');
            
            return ['success' => true, 'message' => 'Mot de passe réinitialisé'];
            
        } catch (Exception $e) {
            logError('Erreur reset password: ' . $e->getMessage());
            return ['success' => false, 'error' => 'Erreur serveur'];
        }
    }
    
    /**
     * Lister tous les utilisateurs (DG uniquement)
     */
    public function listUsers() {
        try {
            if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'DG') {
                return ['success' => false, 'error' => 'Accès refusé'];
            }
            
            $sql = 'SELECT id, user_id, name, role, is_active, created_at, last_login 
                    FROM users ORDER BY created_at DESC';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $users = $stmt->fetchAll();
            
            return ['success' => true, 'users' => $users];
            
        } catch (Exception $e) {
            logError('Erreur list users: ' . $e->getMessage());
            return ['success' => false, 'error' => 'Erreur serveur'];
        }
    }
}

// Créer instance Auth
$auth = new Auth($pdo);

?>
