<?php
/**
 * Event Class
 * Handles events and workshops
 */

require_once __DIR__ . '/../config/database.php';

class Event {
    private $conn;
    private $table = 'events';
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Get upcoming events
     * @param int $limit
     * @return array
     */
    public function getUpcomingEvents($limit = 6) {
        try {
            $query = "SELECT e.*, 
                             (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.event_id AND status = 'registered') as registered_count
                      FROM " . $this->table . " e
                      WHERE e.event_date >= CURDATE() 
                      AND e.status = 'upcoming'
                      ORDER BY e.event_date ASC
                      LIMIT :limit";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            return [
                'success' => true,
                'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
            ];

        } catch (PDOException $e) {
            error_log("Get Events Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch events'];
        }
    }

    /**
     * Register user for event
     * @param int $event_id
     * @param int $user_id
     * @return array
     */
    public function registerForEvent($event_id, $user_id) {
        try {
            // Check if event exists and has spots
            $event = $this->getEventById($event_id);
            if (!$event) {
                return ['success' => false, 'message' => 'Event not found'];
            }

            if ($event['registered_count'] >= $event['max_participants']) {
                return ['success' => false, 'message' => 'Event is full'];
            }

            // Check if already registered
            $check = "SELECT registration_id FROM event_registrations 
                      WHERE event_id = :event_id AND user_id = :user_id AND status = 'registered'";
            $stmt = $this->conn->prepare($check);
            $stmt->bindParam(':event_id', $event_id);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ['success' => false, 'message' => 'Already registered for this event'];
            }

            // Register user
            $insert = "INSERT INTO event_registrations (event_id, user_id) VALUES (:event_id, :user_id)";
            $stmt = $this->conn->prepare($insert);
            $stmt->bindParam(':event_id', $event_id);
            $stmt->bindParam(':user_id', $user_id);

            if ($stmt->execute()) {
                // Update current participants
                $this->updateParticipantCount($event_id, 1);
                
                return ['success' => true, 'message' => 'Successfully registered for event'];
            }

            return ['success' => false, 'message' => 'Registration failed'];

        } catch (PDOException $e) {
            error_log("Event Registration Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Get event by ID
     */
    private function getEventById($event_id) {
        $query = "SELECT e.*, 
                         (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.event_id AND status = 'registered') as registered_count
                  FROM " . $this->table . " e
                  WHERE e.event_id = :event_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':event_id', $event_id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Update participant count
     */
    private function updateParticipantCount($event_id, $increment) {
        $query = "UPDATE " . $this->table . "
                  SET current_participants = current_participants + :increment
                  WHERE event_id = :event_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':increment', $increment, PDO::PARAM_INT);
        $stmt->bindParam(':event_id', $event_id);
        $stmt->execute();
    }

    /**
     * Cancel registration
     */
    public function cancelRegistration($event_id, $user_id) {
        try {
            $query = "UPDATE event_registrations 
                      SET status = 'cancelled', cancelled_at = NOW()
                      WHERE event_id = :event_id AND user_id = :user_id AND status = 'registered'";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':event_id', $event_id);
            $stmt->bindParam(':user_id', $user_id);

            if ($stmt->execute() && $stmt->rowCount() > 0) {
                $this->updateParticipantCount($event_id, -1);
                return ['success' => true, 'message' => 'Registration cancelled'];
            }

            return ['success' => false, 'message' => 'Cancellation failed'];

        } catch (PDOException $e) {
            error_log("Cancel Registration Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Get user's registered events
     */
    public function getUserEvents($user_id) {
        $query = "SELECT e.*, er.status, er.registered_at
                  FROM events e
                  JOIN event_registrations er ON e.event_id = er.event_id
                  WHERE er.user_id = :user_id
                  ORDER BY e.event_date DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Admin: list events
     */
    public function adminList($filters = []) {
        try {
            $query = "SELECT e.*
                      FROM " . $this->table . " e
                      WHERE 1=1";
            $params = [];
            if (!empty($filters['status'])) {
                $query .= " AND e.status = :status";
                $params[':status'] = $filters['status'];
            }
            if (!empty($filters['search'])) {
                $query .= " AND (e.title LIKE :search OR e.description LIKE :search OR e.location LIKE :search)";
                $params[':search'] = '%' . $filters['search'] . '%';
            }
            $query .= " ORDER BY e.event_date DESC";
            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => &$value) {
                $stmt->bindParam($key, $value);
            }
            $stmt->execute();
            return ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            error_log("Admin List Events Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch events'];
        }
    }

    /**
     * Admin: create event
     */
    public function adminCreate($data) {
        try {
            $required = ['title', 'description', 'event_date', 'location'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    return ['success' => false, 'message' => ucfirst($field) . ' is required'];
                }
            }
            $query = "INSERT INTO " . $this->table . "
                      (title, description, event_date, event_time, location, max_participants, price, image_path, status)
                      VALUES
                      (:title, :description, :event_date, :event_time, :location, :max_participants, :price, :image_path, :status)";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':title', sanitize($data['title']));
            $stmt->bindParam(':description', sanitize($data['description']));
            $stmt->bindParam(':event_date', $data['event_date']);
            $stmt->bindParam(':event_time', $data['event_time']);
            $stmt->bindParam(':location', sanitize($data['location']));
            $stmt->bindParam(':max_participants', $data['max_participants']);
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':image_path', $data['image_path']);
            $stmt->bindParam(':status', $data['status']);

            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Event created'];
            }
            return ['success' => false, 'message' => 'Failed to create event'];
        } catch (PDOException $e) {
            error_log("Admin Create Event Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Admin: update event
     */
    public function adminUpdate($data) {
        try {
            if (empty($data['event_id'])) {
                return ['success' => false, 'message' => 'Event ID is required'];
            }
            $query = "UPDATE " . $this->table . "
                      SET title = :title,
                          description = :description,
                          event_date = :event_date,
                          event_time = :event_time,
                          location = :location,
                          max_participants = :max_participants,
                          price = :price,
                          image_path = :image_path,
                          status = :status
                      WHERE event_id = :event_id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':title', sanitize($data['title']));
            $stmt->bindParam(':description', sanitize($data['description']));
            $stmt->bindParam(':event_date', $data['event_date']);
            $stmt->bindParam(':event_time', $data['event_time']);
            $stmt->bindParam(':location', sanitize($data['location']));
            $stmt->bindParam(':max_participants', $data['max_participants']);
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':image_path', $data['image_path']);
            $stmt->bindParam(':status', $data['status']);
            $stmt->bindParam(':event_id', $data['event_id']);

            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Event updated'];
            }
            return ['success' => false, 'message' => 'Failed to update event'];
        } catch (PDOException $e) {
            error_log("Admin Update Event Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Admin: delete event
     */
    public function adminDelete($event_id) {
        try {
            if (!$event_id) {
                return ['success' => false, 'message' => 'Event ID is required'];
            }
            $stmt = $this->conn->prepare("DELETE FROM " . $this->table . " WHERE event_id = :id");
            $stmt->bindParam(':id', $event_id);
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Event deleted'];
            }
            return ['success' => false, 'message' => 'Failed to delete event'];
        } catch (PDOException $e) {
            error_log("Admin Delete Event Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }
}
?>
