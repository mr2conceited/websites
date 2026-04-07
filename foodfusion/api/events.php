<?php
/**
 * Events API Endpoint
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/Event.php';
require_once __DIR__ . '/../includes/User.php';

$event = new Event();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['user_id']) && User::isLoggedIn()) {
            // Get user's registered events
            $result = $event->getUserEvents($_SESSION['user_id']);
            echo json_encode(['success' => true, 'data' => $result]);
        } else {
            // Get upcoming events
            $limit = $_GET['limit'] ?? 6;
            $result = $event->getUpcomingEvents($limit);
            echo json_encode($result);
        }
        break;

    case 'POST':
        // Register for event
        if (!User::isLoggedIn()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Please login to register for events']);
            exit();
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['event_id'])) {
            echo json_encode(['success' => false, 'message' => 'Event ID is required']);
            exit();
        }

        $result = $event->registerForEvent($input['event_id'], $_SESSION['user_id']);
        echo json_encode($result);
        break;

    case 'DELETE':
        // Cancel registration
        if (!User::isLoggedIn()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Please login']);
            exit();
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['event_id'])) {
            echo json_encode(['success' => false, 'message' => 'Event ID is required']);
            exit();
        }

        $result = $event->cancelRegistration($input['event_id'], $_SESSION['user_id']);
        echo json_encode($result);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>