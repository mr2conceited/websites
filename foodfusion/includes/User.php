<?php
/**
 * User Class
 * Handles all user-related operations
 */

require_once __DIR__ . '/../config/database.php';

class User {
    private $conn;
    private $table = 'users';
    
    // User properties
    public $user_id;
    public $first_name;
    public $last_name;
    public $email;
    public $password;
    public $profile_image;
    public $bio;
    public $role;
    public $failed_login_attempts;
    public $locked_until;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Register new user
     * @return array
     */
    public function register() {
        try {
            // Check if email already exists
            if ($this->emailExists()) {
                return ['success' => false, 'message' => 'Email already registered'];
            }

            // Validate password strength
            $passwordValidation = $this->validatePassword($this->password);
            if (!$passwordValidation['valid']) {
                return $passwordValidation;
            }

            // Hash password
            $hashed_password = password_hash($this->password, PASSWORD_DEFAULT);

            $query = "INSERT INTO " . $this->table . "
                      (first_name, last_name, email, password_hash, profile_image, bio, role)
                      VALUES (:first_name, :last_name, :email, :password_hash, :profile_image, :bio, :role)";

            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $this->first_name = sanitize($this->first_name);
            $this->last_name = sanitize($this->last_name);
            $this->email = sanitize($this->email);
            $this->profile_image = $this->profile_image ?? 'default-avatar.png';
            $this->bio = sanitize($this->bio ?? '');
            $this->role = 'user';

            // Bind parameters
            $stmt->bindParam(':first_name', $this->first_name);
            $stmt->bindParam(':last_name', $this->last_name);
            $stmt->bindParam(':email', $this->email);
            $stmt->bindParam(':password_hash', $hashed_password);
            $stmt->bindParam(':profile_image', $this->profile_image);
            $stmt->bindParam(':bio', $this->bio);
            $stmt->bindParam(':role', $this->role);

            if ($stmt->execute()) {
                $this->user_id = $this->conn->lastInsertId();
                
                // Log activity
                $this->logActivity('user_registered');
                
                return [
                    'success' => true,
                    'message' => 'Registration successful',
                    'user_id' => $this->user_id
                ];
            }

            return ['success' => false, 'message' => 'Registration failed'];

        } catch (PDOException $e) {
            error_log("Registration Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error occurred'];
        }
    }

    /**
     * Login user with lockout feature
     * @return array
     */
    public function login() {
        try {
            // Check if email exists
            if (!$this->emailExists()) {
                return ['success' => false, 'message' => 'Invalid email or password'];
            }

            // Check if account is locked
            if ($this->isLocked()) {
                $remaining = $this->getRemainingLockTime();
                return [
                    'success' => false,
                    'message' => "Account locked. Try again in {$remaining} minutes",
                    'locked' => true,
                    'remaining_minutes' => $remaining
                ];
            }

            // Verify password
            if (password_verify($this->password, $this->password_hash)) {
                // Successful login - reset failed attempts
                $this->resetFailedAttempts();
                
                // Update last login
                $this->updateLastLogin();
                
                // Log activity
                $this->logActivity('user_login');
                
                // Set session
                $_SESSION['user_id'] = $this->user_id;
                $_SESSION['user_name'] = $this->first_name . ' ' . $this->last_name;
                $_SESSION['user_email'] = $this->email;
                $_SESSION['user_role'] = $this->role;
                
                return [
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => [
                        'id' => $this->user_id,
                        'name' => $this->first_name . ' ' . $this->last_name,
                        'email' => $this->email,
                        'role' => $this->role
                    ]
                ];
            } else {
                // Failed login - increment attempts
                $attempts_left = $this->incrementFailedAttempts();
                
                return [
                    'success' => false,
                    'message' => 'Invalid email or password',
                    'attempts_left' => $attempts_left
                ];
            }

        } catch (PDOException $e) {
            error_log("Login Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Login failed'];
        }
    }

    /**
     * Check if email exists in database
     * @return boolean
     */
    private function emailExists() {
        $query = "SELECT user_id, first_name, last_name, password_hash, failed_login_attempts, locked_until, role, profile_image
                  FROM " . $this->table . "
                  WHERE email = :email
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->user_id = $row['user_id'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->password_hash = $row['password_hash'];
            $this->failed_login_attempts = $row['failed_login_attempts'];
            $this->locked_until = $row['locked_until'];
            $this->role = $row['role'];
            $this->profile_image = $row['profile_image'];
            return true;
        }

        return false;
    }

    /**
     * Check if account is locked
     * @return boolean
     */
    private function isLocked() {
        if ($this->locked_until && strtotime($this->locked_until) > time()) {
            return true;
        }
        // Clear lock if expired
        if ($this->locked_until && strtotime($this->locked_until) <= time()) {
            $this->resetFailedAttempts();
        }
        return false;
    }

    /**
     * Get remaining lock time in minutes
     * @return int
     */
    private function getRemainingLockTime() {
        if (!$this->locked_until) return 0;
        $remaining = strtotime($this->locked_until) - time();
        return ceil($remaining / 60);
    }

    /**
     * Increment failed login attempts
     * @return int attempts left until lock
     */
    private function incrementFailedAttempts() {
        $new_attempts = $this->failed_login_attempts + 1;
        $locked_until = null;
        $attempts_left = 3 - $new_attempts;

        if ($new_attempts >= 3) {
            // Lock account for 3 minutes
            $locked_until = date('Y-m-d H:i:s', strtotime('+3 minutes'));
            $attempts_left = 0;
        }

        $query = "UPDATE " . $this->table . "
                  SET failed_login_attempts = :attempts,
                      locked_until = :locked_until
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':attempts', $new_attempts);
        $stmt->bindParam(':locked_until', $locked_until);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();

        return $attempts_left;
    }

    /**
     * Reset failed attempts after successful login
     */
    private function resetFailedAttempts() {
        $query = "UPDATE " . $this->table . "
                  SET failed_login_attempts = 0,
                      locked_until = NULL
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();
    }

    /**
     * Update last login timestamp
     */
    private function updateLastLogin() {
        $query = "UPDATE " . $this->table . "
                  SET last_login = NOW()
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();
    }

    /**
     * Validate password strength
     * @param string $password
     * @return array
     */
    private function validatePassword($password) {
        if (strlen($password) < 8) {
            return ['valid' => false, 'message' => 'Password must be at least 8 characters'];
        }
        if (!preg_match('/[A-Z]/', $password)) {
            return ['valid' => false, 'message' => 'Password must contain at least one uppercase letter'];
        }
        if (!preg_match('/[a-z]/', $password)) {
            return ['valid' => false, 'message' => 'Password must contain at least one lowercase letter'];
        }
        if (!preg_match('/[0-9]/', $password)) {
            return ['valid' => false, 'message' => 'Password must contain at least one number'];
        }
        return ['valid' => true];
    }

    /**
     * Get user by ID
     * @param int $user_id
     * @return array|false
     */
    public function getUserById($user_id) {
        $query = "SELECT user_id, first_name, last_name, email, profile_image, bio, role, created_at, last_login
                  FROM " . $this->table . "
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Update user profile
     * @return boolean
     */
    public function updateProfile() {
        $query = "UPDATE " . $this->table . "
                  SET first_name = :first_name,
                      last_name = :last_name,
                      bio = :bio,
                      profile_image = :profile_image
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':first_name', $this->first_name);
        $stmt->bindParam(':last_name', $this->last_name);
        $stmt->bindParam(':bio', $this->bio);
        $stmt->bindParam(':profile_image', $this->profile_image);
        $stmt->bindParam(':user_id', $this->user_id);

        if ($stmt->execute()) {
            $this->logActivity('profile_updated');
            return true;
        }

        return false;
    }

    /**
     * Change password
     * @param string $current_password
     * @param string $new_password
     * @return array
     */
    public function changePassword($current_password, $new_password) {
        // Verify current password
        if (!password_verify($current_password, $this->password_hash)) {
            return ['success' => false, 'message' => 'Current password is incorrect'];
        }

        // Validate new password
        $validation = $this->validatePassword($new_password);
        if (!$validation['valid']) {
            return $validation;
        }

        // Hash new password
        $new_hash = password_hash($new_password, PASSWORD_DEFAULT);

        $query = "UPDATE " . $this->table . "
                  SET password_hash = :password_hash
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':password_hash', $new_hash);
        $stmt->bindParam(':user_id', $this->user_id);

        if ($stmt->execute()) {
            $this->logActivity('password_changed');
            return ['success' => true, 'message' => 'Password changed successfully'];
        }

        return ['success' => false, 'message' => 'Password change failed'];
    }

    /**
     * Log user activity
     * @param string $action
     */
    private function logActivity($action) {
        $query = "INSERT INTO activity_logs (user_id, action, ip_address, user_agent)
                  VALUES (:user_id, :action, :ip_address, :user_agent)";

        $stmt = $this->conn->prepare($query);
        
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':action', $action);
        $stmt->bindParam(':ip_address', $ip);
        $stmt->bindParam(':user_agent', $user_agent);
        $stmt->execute();
    }

    /**
     * Logout user
     */
    public function logout() {
        $this->logActivity('user_logout');
        $_SESSION = array();
        session_destroy();
    }

    /**
     * Check if user is logged in
     * @return boolean
     */
    public static function isLoggedIn() {
        return isset($_SESSION['user_id']);
    }

    /**
     * Get current user from session
     * @return array|null
     */
    public static function getCurrentUser() {
        if (!self::isLoggedIn()) {
            return null;
        }

        return [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email'],
            'role' => $_SESSION['user_role']
        ];
    }
}
?>