<?php
/**
 * Recipe Class
 * Handles all recipe-related operations
 */

require_once __DIR__ . '/../config/database.php';

class Recipe {
    private $conn;
    private $table = 'recipes';
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Get all recipes with filters
     * @param array $filters
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function getAllRecipes($filters = [], $limit = 12, $offset = 0) {
        try {
            $query = "SELECT r.*, 
                             u.first_name, u.last_name, u.profile_image,
                             (SELECT COUNT(*) FROM recipe_likes WHERE recipe_id = r.recipe_id) as likes_count,
                             (SELECT COUNT(*) FROM recipe_comments WHERE recipe_id = r.recipe_id) as comments_count
                      FROM " . $this->table . " r
                      LEFT JOIN users u ON r.user_id = u.user_id
                      WHERE r.status = 'published'";

            $params = [];

            // Apply filters
            if (!empty($filters['cuisine'])) {
                $query .= " AND r.cuisine_type = :cuisine";
                $params[':cuisine'] = $filters['cuisine'];
            }

            if (!empty($filters['difficulty'])) {
                $query .= " AND r.difficulty_level = :difficulty";
                $params[':difficulty'] = $filters['difficulty'];
            }

            if (!empty($filters['dietary'])) {
                $query .= " AND JSON_CONTAINS(r.dietary_preferences, :dietary, '$')";
                $params[':dietary'] = json_encode($filters['dietary']);
            }

            if (!empty($filters['search'])) {
                $query .= " AND (r.title LIKE :search OR r.description LIKE :search OR r.ingredients LIKE :search)";
                $params[':search'] = '%' . $filters['search'] . '%';
            }

            if (!empty($filters['user_id'])) {
                $query .= " AND r.user_id = :user_id";
                $params[':user_id'] = $filters['user_id'];
            }

            // Order by
            $order_by = $filters['sort'] ?? 'created_at';
            $order_dir = $filters['order'] ?? 'DESC';
            $query .= " ORDER BY r.{$order_by} {$order_dir}";

            // Pagination
            $query .= " LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($query);

            // Bind parameters
            foreach ($params as $key => &$value) {
                $stmt->bindParam($key, $value);
            }

            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            
            $stmt->execute();

            return [
                'success' => true,
                'data' => $stmt->fetchAll(PDO::FETCH_ASSOC),
                'total' => $this->getTotalRecipes($filters)
            ];

        } catch (PDOException $e) {
            error_log("Get Recipes Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch recipes'];
        }
    }

    /**
     * Get total number of recipes for pagination
     */
    private function getTotalRecipes($filters = []) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE status = 'published'";
        
        if (!empty($filters['cuisine'])) {
            $query .= " AND cuisine_type = '{$filters['cuisine']}'";
        }
        
        $stmt = $this->conn->query($query);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result['total'];
    }

    /**
     * Get single recipe by ID
     * @param int $recipe_id
     * @return array
     */
    public function getRecipeById($recipe_id) {
        try {
            // Increment view count
            $this->incrementViews($recipe_id);

            $query = "SELECT r.*, 
                             u.first_name, u.last_name, u.profile_image, u.bio,
                             (SELECT COUNT(*) FROM recipe_likes WHERE recipe_id = r.recipe_id) as likes_count,
                             (SELECT COUNT(*) FROM recipe_comments WHERE recipe_id = r.recipe_id) as comments_count
                      FROM " . $this->table . " r
                      LEFT JOIN users u ON r.user_id = u.user_id
                      WHERE r.recipe_id = :recipe_id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':recipe_id', $recipe_id);
            $stmt->execute();

            $recipe = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($recipe) {
                // Parse JSON fields (fallback to pipe-separated text)
                $ing = json_decode($recipe['ingredients'], true);
                $ins = json_decode($recipe['instructions'], true);
                $recipe['ingredients'] = is_array($ing) ? $ing : array_filter(explode('|', $recipe['ingredients'] ?? ''));
                $recipe['instructions'] = is_array($ins) ? $ins : array_filter(explode('|', $recipe['instructions'] ?? ''));
                $recipe['dietary_preferences'] = json_decode($recipe['dietary_preferences'], true);
                
                // Get comments
                $recipe['comments'] = $this->getComments($recipe_id);
            }

            return [
                'success' => true,
                'data' => $recipe
            ];

        } catch (PDOException $e) {
            error_log("Get Recipe Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch recipe'];
        }
    }

    /**
     * Create new recipe
     * @param array $data
     * @return array
     */
    public function createRecipe($data) {
        try {
            $query = "INSERT INTO " . $this->table . "
                      (user_id, title, description, ingredients, instructions, prep_time, cook_time, 
                       total_time, servings, cuisine_type, dietary_preferences, difficulty_level, image_path, video_url)
                      VALUES 
                      (:user_id, :title, :description, :ingredients, :instructions, :prep_time, :cook_time,
                       :total_time, :servings, :cuisine_type, :dietary_preferences, :difficulty_level, :image_path, :video_url)";

            $stmt = $this->conn->prepare($query);

            // Calculate total time
            $total_time = ($data['prep_time'] ?? 0) + ($data['cook_time'] ?? 0);

            // Convert arrays to JSON
            $ingredients = json_encode($data['ingredients']);
            $instructions = json_encode($data['instructions']);
            $dietary = json_encode($data['dietary_preferences'] ?? []);

            // Sanitize inputs
            $data['title'] = sanitize($data['title']);
            $data['description'] = sanitize($data['description']);

            // Bind parameters
            $stmt->bindParam(':user_id', $data['user_id']);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':ingredients', $ingredients);
            $stmt->bindParam(':instructions', $instructions);
            $stmt->bindParam(':prep_time', $data['prep_time']);
            $stmt->bindParam(':cook_time', $data['cook_time']);
            $stmt->bindParam(':total_time', $total_time);
            $stmt->bindParam(':servings', $data['servings']);
            $stmt->bindParam(':cuisine_type', $data['cuisine_type']);
            $stmt->bindParam(':dietary_preferences', $dietary);
            $stmt->bindParam(':difficulty_level', $data['difficulty_level']);
            $stmt->bindParam(':image_path', $data['image_path']);
            $stmt->bindParam(':video_url', $data['video_url']);

            if ($stmt->execute()) {
                $recipe_id = $this->conn->lastInsertId();
                
                // Log activity
                $this->logActivity($data['user_id'], 'recipe_created', $recipe_id);
                
                return [
                    'success' => true,
                    'message' => 'Recipe created successfully',
                    'recipe_id' => $recipe_id
                ];
            }

            return ['success' => false, 'message' => 'Failed to create recipe'];

        } catch (PDOException $e) {
            error_log("Create Recipe Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error occurred'];
        }
    }

    /**
     * Like/unlike recipe
     * @param int $recipe_id
     * @param int $user_id
     * @return array
     */
    public function likeRecipe($recipe_id, $user_id) {
        try {
            // Check if already liked
            $check = "SELECT like_id FROM recipe_likes WHERE recipe_id = :recipe_id AND user_id = :user_id";
            $stmt = $this->conn->prepare($check);
            $stmt->bindParam(':recipe_id', $recipe_id);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                // Unlike
                $delete = "DELETE FROM recipe_likes WHERE recipe_id = :recipe_id AND user_id = :user_id";
                $stmt = $this->conn->prepare($delete);
                $stmt->bindParam(':recipe_id', $recipe_id);
                $stmt->bindParam(':user_id', $user_id);
                $stmt->execute();
                
                // Decrement likes count
                $this->updateLikesCount($recipe_id, -1);
                
                return ['success' => true, 'action' => 'unliked'];
            } else {
                // Like
                $insert = "INSERT INTO recipe_likes (recipe_id, user_id) VALUES (:recipe_id, :user_id)";
                $stmt = $this->conn->prepare($insert);
                $stmt->bindParam(':recipe_id', $recipe_id);
                $stmt->bindParam(':user_id', $user_id);
                $stmt->execute();
                
                // Increment likes count
                $this->updateLikesCount($recipe_id, 1);
                
                return ['success' => true, 'action' => 'liked'];
            }

        } catch (PDOException $e) {
            error_log("Like Recipe Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to process like'];
        }
    }

    /**
     * Update likes count in recipes table
     */
    private function updateLikesCount($recipe_id, $increment) {
        $query = "UPDATE " . $this->table . "
                  SET likes_count = likes_count + :increment
                  WHERE recipe_id = :recipe_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':increment', $increment, PDO::PARAM_INT);
        $stmt->bindParam(':recipe_id', $recipe_id);
        $stmt->execute();
    }

    /**
     * Add comment to recipe
     * @param int $recipe_id
     * @param int $user_id
     * @param string $comment
     * @return array
     */
    public function addComment($recipe_id, $user_id, $comment) {
        try {
            $query = "INSERT INTO recipe_comments (recipe_id, user_id, comment)
                      VALUES (:recipe_id, :user_id, :comment)";

            $stmt = $this->conn->prepare($query);
            
            $comment = sanitize($comment);

            $stmt->bindParam(':recipe_id', $recipe_id);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':comment', $comment);

            if ($stmt->execute()) {
                return [
                    'success' => true,
                    'message' => 'Comment added',
                    'comment_id' => $this->conn->lastInsertId()
                ];
            }

            return ['success' => false, 'message' => 'Failed to add comment'];

        } catch (PDOException $e) {
            error_log("Add Comment Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Get comments for a recipe
     * @param int $recipe_id
     * @return array
     */
    public function getComments($recipe_id) {
        $query = "SELECT c.*, u.first_name, u.last_name, u.profile_image
                  FROM recipe_comments c
                  JOIN users u ON c.user_id = u.user_id
                  WHERE c.recipe_id = :recipe_id
                  ORDER BY c.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':recipe_id', $recipe_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Increment view count
     */
    private function incrementViews($recipe_id) {
        $query = "UPDATE " . $this->table . "
                  SET views_count = views_count + 1
                  WHERE recipe_id = :recipe_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':recipe_id', $recipe_id);
        $stmt->execute();
    }

    /**
     * Get featured recipes
     * @param int $limit
     * @return array
     */
    public function getFeaturedRecipes($limit = 6) {
        $filters = ['is_featured' => true];
        return $this->getAllRecipes($filters, $limit, 0);
    }

    /**
     * Log activity
     */
    private function logActivity($user_id, $action, $recipe_id = null) {
        $query = "INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
                  VALUES (:user_id, :action, :details, :ip_address, :user_agent)";

        $stmt = $this->conn->prepare($query);
        
        $details = $recipe_id ? json_encode(['recipe_id' => $recipe_id]) : null;
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':action', $action);
        $stmt->bindParam(':details', $details);
        $stmt->bindParam(':ip_address', $ip);
        $stmt->bindParam(':user_agent', $user_agent);
        $stmt->execute();
    }

    /**
     * Admin: list recipes
     */
    public function adminList($filters = []) {
        try {
            $query = "SELECT r.recipe_id, r.title, r.cuisine_type, r.difficulty_level, r.status,
                             r.featured, r.prep_time, r.cook_time, r.servings, r.image_path,
                             r.description, r.ingredients, r.instructions, r.updated_at
                      FROM " . $this->table . " r
                      WHERE 1=1";

            $params = [];
            if (!empty($filters['status'])) {
                $query .= " AND r.status = :status";
                $params[':status'] = $filters['status'];
            }
            if (!empty($filters['search'])) {
                $query .= " AND (r.title LIKE :search OR r.description LIKE :search OR r.ingredients LIKE :search)";
                $params[':search'] = '%' . $filters['search'] . '%';
            }

            $query .= " ORDER BY r.updated_at DESC";
            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => &$value) {
                $stmt->bindParam($key, $value);
            }
            $stmt->execute();
            return ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            error_log("Admin List Recipes Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch recipes'];
        }
    }

    /**
     * Admin: create recipe
     */
    public function adminCreate($data) {
        try {
            $required = ['title', 'description', 'ingredients', 'instructions', 'cuisine_type', 'difficulty_level'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    return ['success' => false, 'message' => ucfirst($field) . ' is required'];
                }
            }
            $query = "INSERT INTO " . $this->table . "
                      (user_id, title, description, ingredients, instructions, prep_time, cook_time,
                       total_time, servings, cuisine_type, difficulty_level, image_path, featured, status)
                      VALUES
                      (:user_id, :title, :description, :ingredients, :instructions, :prep_time, :cook_time,
                       :total_time, :servings, :cuisine_type, :difficulty_level, :image_path, :featured, :status)";

            $stmt = $this->conn->prepare($query);
            $prep = (int)($data['prep_time'] ?? 0);
            $cook = (int)($data['cook_time'] ?? 0);
            $total_time = $prep + $cook;

            $stmt->bindParam(':user_id', $_SESSION['user_id']);
            $stmt->bindParam(':title', sanitize($data['title']));
            $stmt->bindParam(':description', sanitize($data['description']));
            $stmt->bindParam(':ingredients', $data['ingredients']);
            $stmt->bindParam(':instructions', $data['instructions']);
            $stmt->bindParam(':prep_time', $prep);
            $stmt->bindParam(':cook_time', $cook);
            $stmt->bindParam(':total_time', $total_time);
            $stmt->bindParam(':servings', $data['servings']);
            $stmt->bindParam(':cuisine_type', $data['cuisine_type']);
            $stmt->bindParam(':difficulty_level', $data['difficulty_level']);
            $stmt->bindParam(':image_path', $data['image_path']);
            $stmt->bindParam(':featured', $data['featured']);
            $stmt->bindParam(':status', $data['status']);

            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Recipe created'];
            }
            return ['success' => false, 'message' => 'Failed to create recipe'];
        } catch (PDOException $e) {
            error_log("Admin Create Recipe Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Admin: update recipe
     */
    public function adminUpdate($data) {
        try {
            if (empty($data['recipe_id'])) {
                return ['success' => false, 'message' => 'Recipe ID is required'];
            }
            $query = "UPDATE " . $this->table . "
                      SET title = :title,
                          description = :description,
                          ingredients = :ingredients,
                          instructions = :instructions,
                          cuisine_type = :cuisine_type,
                          difficulty_level = :difficulty_level,
                          prep_time = :prep_time,
                          cook_time = :cook_time,
                          total_time = :total_time,
                          servings = :servings,
                          image_path = :image_path,
                          featured = :featured,
                          status = :status
                      WHERE recipe_id = :recipe_id";

            $stmt = $this->conn->prepare($query);
            $prep = (int)($data['prep_time'] ?? 0);
            $cook = (int)($data['cook_time'] ?? 0);
            $total_time = $prep + $cook;

            $stmt->bindParam(':title', sanitize($data['title']));
            $stmt->bindParam(':description', sanitize($data['description']));
            $stmt->bindParam(':ingredients', $data['ingredients']);
            $stmt->bindParam(':instructions', $data['instructions']);
            $stmt->bindParam(':cuisine_type', $data['cuisine_type']);
            $stmt->bindParam(':difficulty_level', $data['difficulty_level']);
            $stmt->bindParam(':prep_time', $prep);
            $stmt->bindParam(':cook_time', $cook);
            $stmt->bindParam(':total_time', $total_time);
            $stmt->bindParam(':servings', $data['servings']);
            $stmt->bindParam(':image_path', $data['image_path']);
            $stmt->bindParam(':featured', $data['featured']);
            $stmt->bindParam(':status', $data['status']);
            $stmt->bindParam(':recipe_id', $data['recipe_id']);

            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Recipe updated'];
            }
            return ['success' => false, 'message' => 'Failed to update recipe'];
        } catch (PDOException $e) {
            error_log("Admin Update Recipe Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Admin: delete recipe
     */
    public function adminDelete($recipe_id) {
        try {
            if (!$recipe_id) {
                return ['success' => false, 'message' => 'Recipe ID is required'];
            }
            $stmt = $this->conn->prepare("DELETE FROM " . $this->table . " WHERE recipe_id = :id");
            $stmt->bindParam(':id', $recipe_id);
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Recipe deleted'];
            }
            return ['success' => false, 'message' => 'Failed to delete recipe'];
        } catch (PDOException $e) {
            error_log("Admin Delete Recipe Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }
}
?>
