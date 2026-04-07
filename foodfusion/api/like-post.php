<?php
/**
 * Like/Unlike Post API Endpoint
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/CommunityPost.php';
require_once __DIR__ . '/../includes/User.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

if (!User::isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please login to like posts']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    $input = $_POST;
}

if (empty($input['post_id'])) {
    echo json_encode(['success' => false, 'message' => 'Post ID is required']);
    exit();
}

$post = new CommunityPost();
$result = $post->likePost($input['post_id'], $_SESSION['user_id']);

echo json_encode($result);
?>