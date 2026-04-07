<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/User.php';
require_once __DIR__ . '/../includes/Recipe.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!User::isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please log in to like recipes']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$recipe_id = (int)($input['recipe_id'] ?? 0);

if (!$recipe_id) {
    echo json_encode(['success' => false, 'message' => 'Recipe ID is required']);
    exit;
}

$recipe = new Recipe();
$result = $recipe->likeRecipe($recipe_id, $_SESSION['user_id']);
echo json_encode($result);
?>
