<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/User.php';
require_once __DIR__ . '/../includes/Recipe.php';
require_once __DIR__ . '/../includes/CommunityPost.php';

$type = $_GET['type'] ?? ($_POST['type'] ?? '');
$id   = (int)($_GET['id'] ?? ($_POST['id'] ?? 0));

if (!in_array($type, ['recipe', 'post']) || !$id) {
    echo json_encode(['success' => false, 'message' => 'Missing type or id']);
    exit;
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        if ($type === 'recipe') {
            $recipe   = new Recipe();
            $comments = $recipe->getComments($id);
            echo json_encode(['success' => true, 'comments' => $comments]);
        } else {
            $post     = new CommunityPost();
            $comments = $post->getComments($id);
            echo json_encode(['success' => true, 'comments' => $comments]);
        }
        break;

    case 'POST':
        if (!User::isLoggedIn()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Please log in to comment']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $comment = trim($input['comment'] ?? '');

        if (!$comment) {
            echo json_encode(['success' => false, 'message' => 'Comment cannot be empty']);
            exit;
        }

        if ($type === 'recipe') {
            $recipe = new Recipe();
            $result = $recipe->addComment($id, $_SESSION['user_id'], $comment);
        } else {
            $post      = new CommunityPost();
            $parent_id = !empty($input['parent_id']) ? (int)$input['parent_id'] : null;
            $result    = $post->addComment($id, $_SESSION['user_id'], $comment, $parent_id);
        }

        echo json_encode($result);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
