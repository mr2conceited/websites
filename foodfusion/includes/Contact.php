<?php
/**
 * Contact Class
 * Handles contact messages and newsletter
 */

require_once __DIR__ . '/../config/database.php';

class Contact {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Save contact message
     * @param array $data
     * @return array
     */
    public function saveMessage($data) {
        try {
            $query = "INSERT INTO contact_messages (name, email, subject, message, ip_address, user_agent)
                      VALUES (:name, :email, :subject, :message, :ip_address, :user_agent)";

            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $data['name'] = sanitize($data['name']);
            $data['email'] = sanitize($data['email']);
            $data['subject'] = sanitize($data['subject'] ?? 'General Inquiry');
            $data['message'] = sanitize($data['message']);

            // Get IP and user agent
            $ip = $_SERVER['REMOTE_ADDR'] ?? null;
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':subject', $data['subject']);
            $stmt->bindParam(':message', $data['message']);
            $stmt->bindParam(':ip_address', $ip);
            $stmt->bindParam(':user_agent', $user_agent);

            if ($stmt->execute()) {
                // Send email notification
                $this->sendEmailNotification($data);
                
                return [
                    'success' => true,
                    'message' => 'Message sent successfully'
                ];
            }

            return ['success' => false, 'message' => 'Failed to send message'];

        } catch (PDOException $e) {
            error_log("Contact Message Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Send email notification
     */
    private function sendEmailNotification($data) {
        $to = "admin@foodfusion.com";
        $subject = "New Contact Form: " . $data['subject'];
        
        $message = "Name: " . $data['name'] . "\n";
        $message .= "Email: " . $data['email'] . "\n\n";
        $message .= "Message:\n" . $data['message'];
        
        $headers = "From: " . $data['email'] . "\r\n";
        $headers .= "Reply-To: " . $data['email'] . "\r\n";
        
        mail($to, $subject, $message, $headers);
    }

    /**
     * Subscribe to newsletter
     * @param string $email
     * @param string $name
     * @return array
     */
    public function subscribeNewsletter($email, $name = null) {
        try {
            // Check if already subscribed
            $check = "SELECT subscriber_id FROM newsletter_subscribers WHERE email = :email";
            $stmt = $this->conn->prepare($check);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                // Update if unsubscribed
                $update = "UPDATE newsletter_subscribers 
                          SET is_active = TRUE, unsubscribed_at = NULL
                          WHERE email = :email";
                $stmt = $this->conn->prepare($update);
                $stmt->bindParam(':email', $email);
                $stmt->execute();
                
                return ['success' => true, 'message' => 'Newsletter subscription updated'];
            }

            // Insert new subscriber
            $insert = "INSERT INTO newsletter_subscribers (email, name) VALUES (:email, :name)";
            $stmt = $this->conn->prepare($insert);
            
            $name = $name ? sanitize($name) : null;
            
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':name', $name);

            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Successfully subscribed to newsletter'];
            }

            return ['success' => false, 'message' => 'Subscription failed'];

        } catch (PDOException $e) {
            error_log("Newsletter Subscription Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Unsubscribe from newsletter
     */
    public function unsubscribeNewsletter($email) {
        try {
            $query = "UPDATE newsletter_subscribers 
                      SET is_active = FALSE, unsubscribed_at = NOW()
                      WHERE email = :email";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);

            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Successfully unsubscribed'];
            }

            return ['success' => false, 'message' => 'Unsubscribe failed'];

        } catch (PDOException $e) {
            error_log("Unsubscribe Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Track download
     */
    public function trackDownload($user_id, $resource_type, $resource_name, $file_name) {
        try {
            $query = "INSERT INTO downloads (user_id, resource_type, resource_name, file_name, ip_address)
                      VALUES (:user_id, :resource_type, :resource_name, :file_name, :ip_address)";

            $stmt = $this->conn->prepare($query);
            
            $ip = $_SERVER['REMOTE_ADDR'] ?? null;

            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':resource_type', $resource_type);
            $stmt->bindParam(':resource_name', $resource_name);
            $stmt->bindParam(':file_name', $file_name);
            $stmt->bindParam(':ip_address', $ip);

            return $stmt->execute();

        } catch (PDOException $e) {
            error_log("Track Download Error: " . $e->getMessage());
            return false;
        }
    }
}
?>