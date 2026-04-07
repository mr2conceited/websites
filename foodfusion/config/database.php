<?php
/**
 * Database Configuration — FoodFusion
 * Reads from environment variables; falls back to defaults for local dev.
 * Set DB_HOST, DB_NAME, DB_USER, DB_PASS in your environment (or .env via a loader).
 */

class Database {
    private $host     = null;
    private $db_name  = null;
    private $username = null;
    private $password = null;
    private $charset  = 'utf8mb4';
    private $conn;

    public function __construct() {
        $this->host     = getenv('DB_HOST')  ?: 'localhost';
        $this->db_name  = getenv('DB_NAME')  ?: 'foodfusion';
        $this->username = getenv('DB_USER')  ?: 'root';
        $this->password = getenv('DB_PASS')  ?: '';
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        } catch (PDOException $e) {
            error_log("DB Connection Error: " . $e->getMessage());
            return null;
        }
        return $this->conn;
    }

    public function testConnection() {
        $conn = $this->getConnection();
        return $conn
            ? ['success' => true,  'message' => 'Connected successfully']
            : ['success' => false, 'message' => 'Connection failed'];
    }
}

// Session — start once with secure settings
if (session_status() === PHP_SESSION_NONE) {
    session_name('foodfusion_session');
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_strict_mode', 1);
    session_start();
}

// ── Helpers ──────────────────────────────────────────────

function sanitize($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
?>
