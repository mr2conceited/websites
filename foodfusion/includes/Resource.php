<?php
/**
 * Resource Class (FIXED)
 * Handles culinary/educational resources
 * Fixed: Foreign key constraint issue with created_by
 */

require_once __DIR__ . '/../config/database.php';

class Resource {
    private $conn;
    private $table = 'resources';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function getPublic($category = '') {
        try {
            $query = "SELECT resource_id, title, description, category, resource_type, file_path, created_at
                      FROM {$this->table}
                      WHERE 1=1";
            $params = [];
            if (!empty($category)) {
                $query .= " AND category = :category";
                $params[':category'] = $category;
            }
            $query .= " ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => &$value) {
                $stmt->bindParam($key, $value);
            }
            $stmt->execute();
            return ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            error_log("Get Resources Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch resources'];
        }
    }

    public function adminList($filters = []) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE 1=1";
            $params = [];
            if (!empty($filters['search'])) {
                $query .= " AND (title LIKE :search OR description LIKE :search)";
                $params[':search'] = '%' . $filters['search'] . '%';
            }
            if (!empty($filters['category'])) {
                $query .= " AND category = :category";
                $params[':category'] = $filters['category'];
            }
            if (!empty($filters['type'])) {
                $query .= " AND resource_type = :type";
                $params[':type'] = $filters['type'];
            }
            $query .= " ORDER BY updated_at DESC";
            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => &$value) {
                $stmt->bindParam($key, $value);
            }
            $stmt->execute();
            return ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            error_log("Admin List Resources Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch resources'];
        }
    }

    public function adminCreate($data) {
        try {
            $query = "INSERT INTO {$this->table}
                      (title, description, category, resource_type, file_path, created_by)
                      VALUES (:title, :description, :category, :resource_type, :file_path, :created_by)";
            $stmt = $this->conn->prepare($query);

            $title = sanitize($data['title'] ?? '');
            $desc = sanitize($data['description'] ?? '');
            $category = $data['category'] ?? '';
            $type = $data['resource_type'] ?? 'video';
            $file = $data['file_path'] ?? '';
            
            // FIXED: Safely get user_id from session
            // Allow NULL for created_by to avoid foreign key constraint violations
            $created_by = null;
            if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
                $user_id = intval($_SESSION['user_id']);
                if ($user_id > 0) {
                    $created_by = $user_id;
                }
            }

            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $desc);
            $stmt->bindParam(':category', $category);
            $stmt->bindParam(':resource_type', $type);
            $stmt->bindParam(':file_path', $file);
            $stmt->bindParam(':created_by', $created_by, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return ['success' => true, 'resource_id' => $this->conn->lastInsertId()];
            }
            return ['success' => false, 'message' => 'Failed to create resource'];
        } catch (PDOException $e) {
            error_log("Create Resource Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }

    public function adminUpdate($data) {
        try {
            $query = "UPDATE {$this->table}
                      SET title = :title, description = :description, category = :category,
                          resource_type = :resource_type, file_path = :file_path
                      WHERE resource_id = :resource_id";
            $stmt = $this->conn->prepare($query);

            $title = sanitize($data['title'] ?? '');
            $desc = sanitize($data['description'] ?? '');
            $category = $data['category'] ?? '';
            $type = $data['resource_type'] ?? 'video';
            $file = $data['file_path'] ?? '';
            $rid = $data['resource_id'] ?? null;

            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $desc);
            $stmt->bindParam(':category', $category);
            $stmt->bindParam(':resource_type', $type);
            $stmt->bindParam(':file_path', $file);
            $stmt->bindParam(':resource_id', $rid);

            if ($stmt->execute()) {
                return ['success' => true];
            }
            return ['success' => false, 'message' => 'Failed to update resource'];
        } catch (PDOException $e) {
            error_log("Update Resource Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }

    public function adminDelete($id) {
        try {
            $query = "DELETE FROM {$this->table} WHERE resource_id = :resource_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':resource_id', $id);
            if ($stmt->execute()) {
                return ['success' => true];
            }
            return ['success' => false, 'message' => 'Failed to delete resource'];
        } catch (PDOException $e) {
            error_log("Delete Resource Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
}
?>
