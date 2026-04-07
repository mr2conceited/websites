<?php
/**
 * CommunityPost Class
 * Handles community posts, tips, experiences
 */

require_once __DIR__ . '/../config/database.php';

class CommunityPost {
    private $conn;
    private $table = 'community_posts';
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Create new post
     * @param array $data
     * @return array
     */
    public function createPost($data) {
        try {
            $query = "INSERT INTO " . $this->table . "
                      (user_id, title, content, post_type, cuisine_type, image_path)
                      VALUES (:user_id, :title, :content, :post_type, :cuisine_type, :image_path)";

            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $data['title'] = sanitize($data['title']);
            $data['content'] = sanitize($data['content']);

            $stmt->bindParam(':user_id', $data['user_id']);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':content', $data['content']);
            $stmt->bindParam(':post_type', $data['post_type']);
            $stmt->bindParam(':cuisine_type', $data['cuisine_type']);
            $stmt->bindParam(':image_path', $data['image_path']);

            if ($stmt->execute()) {
                $post_id = $this->conn->lastInsertId();
                
                return [
                    'success' => true,
                    'message' => 'Post created successfully',
                    'post_id' => $post_id
                ];
            }

            return ['success' => false, 'message' => 'Failed to create post'];

        } catch (PDOException $e) {
            error_log("Create Post Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Get all posts
     * @param array $filters
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function getAllPosts($filters = [], $limit = 10, $offset = 0) {
        try {
            $query = "SELECT p.*, 
                             u.first_name, u.last_name, u.profile_image,
                             (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id) as likes_count,
                             (SELECT COUNT(*) FROM post_comments WHERE post_id = p.post_id) as comments_count
                      FROM " . $this->table . " p
                      JOIN users u ON p.user_id = u.user_id
                      WHERE p.status = 'active'";

            $params = [];

            if (!empty($filters['post_type'])) {
                $query .= " AND p.post_type = :post_type";
                $params[':post_type'] = $filters['post_type'];
            }

            if (!empty($filters['cuisine'])) {
                $query .= " AND p.cuisine_type = :cuisine";
                $params[':cuisine'] = $filters['cuisine'];
            }

            $query .= " ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($query);

            foreach ($params as $key => &$value) {
                $stmt->bindParam($key, $value);
            }

            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            
            $stmt->execute();

            return [
                'success' => true,
                'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
            ];

        } catch (PDOException $e) {
            error_log("Get Posts Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch posts'];
        }
    }

    /**
     * Like/unlike post
     * @param int $post_id
     * @param int $user_id
     * @return array
     */
    public function likePost($post_id, $user_id) {
        try {
            // Check if already liked
            $check = "SELECT like_id FROM post_likes WHERE post_id = :post_id AND user_id = :user_id";
            $stmt = $this->conn->prepare($check);
            $stmt->bindParam(':post_id', $post_id);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                // Unlike
                $delete = "DELETE FROM post_likes WHERE post_id = :post_id AND user_id = :user_id";
                $stmt = $this->conn->prepare($delete);
                $stmt->bindParam(':post_id', $post_id);
                $stmt->bindParam(':user_id', $user_id);
                $stmt->execute();
                
                $this->updateLikesCount($post_id, -1);
                
                return ['success' => true, 'action' => 'unliked'];
            } else {
                // Like
                $insert = "INSERT INTO post_likes (post_id, user_id) VALUES (:post_id, :user_id)";
                $stmt = $this->conn->prepare($insert);
                $stmt->bindParam(':post_id', $post_id);
                $stmt->bindParam(':user_id', $user_id);
                $stmt->execute();
                
                $this->updateLikesCount($post_id, 1);
                
                return ['success' => true, 'action' => 'liked'];
            }

        } catch (PDOException $e) {
            error_log("Like Post Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to process like'];
        }
    }

    /**
     * Update likes count
     */
    private function updateLikesCount($post_id, $increment) {
        $query = "UPDATE " . $this->table . "
                  SET likes_count = likes_count + :increment
                  WHERE post_id = :post_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':increment', $increment, PDO::PARAM_INT);
        $stmt->bindParam(':post_id', $post_id);
        $stmt->execute();
    }

    /**
     * Add comment to post
     */
    public function addComment($post_id, $user_id, $comment, $parent_id = null) {
        try {
            $query = "INSERT INTO post_comments (post_id, user_id, parent_comment_id, comment)
                      VALUES (:post_id, :user_id, :parent_id, :comment)";

            $stmt = $this->conn->prepare($query);
            
            $comment = sanitize($comment);

            $stmt->bindParam(':post_id', $post_id);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':parent_id', $parent_id);
            $stmt->bindParam(':comment', $comment);

            if ($stmt->execute()) {
                // Update comments count
                $this->updateCommentsCount($post_id, 1);
                
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
     * Update comments count
     */
    private function updateCommentsCount($post_id, $increment) {
        $query = "UPDATE " . $this->table . "
                  SET comments_count = comments_count + :increment
                  WHERE post_id = :post_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':increment', $increment, PDO::PARAM_INT);
        $stmt->bindParam(':post_id', $post_id);
        $stmt->execute();
    }

    /**
     * Get comments for a post
     */
    public function getComments($post_id) {
        $query = "SELECT c.*, u.first_name, u.last_name, u.profile_image
                  FROM post_comments c
                  JOIN users u ON c.user_id = u.user_id
                  WHERE c.post_id = :post_id
                  ORDER BY c.created_at ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':post_id', $post_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get post statistics
     */
    public function getStats() {
        $stats = [];

        // Total posts
        $query = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE status = 'active'";
        $stmt = $this->conn->query($query);
        $stats['total_posts'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Posts by type
        $query = "SELECT post_type, COUNT(*) as count FROM " . $this->table . " GROUP BY post_type";
        $stmt = $this->conn->query($query);
        $stats['by_type'] = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        // Top contributors
        $query = "SELECT u.user_id, u.first_name, u.last_name, u.profile_image, COUNT(p.post_id) as post_count
                  FROM users u
                  JOIN " . $this->table . " p ON u.user_id = p.user_id
                  GROUP BY u.user_id
                  ORDER BY post_count DESC
                  LIMIT 5";
        $stmt = $this->conn->query($query);
        $stats['top_contributors'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $stats;
    }
}
?>