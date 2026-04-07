<?php
/**
 * Community Posts API Endpoint
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/CommunityPost.php';
require_once __DIR__ . '/../includes/User.php';

$post = new CommunityPost();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $filters = [];
        
        if (isset($_GET['type'])) {
            $filters['post_type'] = $_GET['type'];
        }
        if (isset($_GET['cuisine'])) {
            $filters['cuisine'] = $_GET['cuisine'];
        }
        
        $limit = $_GET['limit'] ?? 10;
        $offset = $_GET['offset'] ?? 0;
        
        if (isset($_GET['stats']) && $_GET['stats'] == 'true') {
            $result = $post->getStats();
        } else {
            $result = $post->getAllPosts($filters, $limit, $offset);
        }
        
        echo json_encode($result);
        break;

    case 'POST':
        if (!User::isLoggedIn()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Please login to create posts']);
            exit();
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            $input = $_POST;
        }

        // Validate required fields
        $required = ['title', 'content', 'post_type'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
                exit();
            }
        }

        $input['user_id'] = $_SESSION['user_id'];
        $result = $post->createPost($input);
        
        echo json_encode($result);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>