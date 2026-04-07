<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/User.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!User::isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please log in to update images']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$type       = $input['type']       ?? '';
$id         = (int)($input['id']   ?? 0);
$image_path = $input['image_path'] ?? '';

if (!in_array($type, ['recipe', 'event']) || !$id || !$image_path) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid fields']);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$db   = new Database();
$conn = $db->getConnection();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$table  = $type === 'recipe' ? 'recipes' : 'events';
$id_col = $type === 'recipe' ? 'recipe_id' : 'event_id';

$stmt = $conn->prepare("UPDATE {$table} SET image_path = :img WHERE {$id_col} = :id");
$stmt->bindParam(':img', $image_path);
$stmt->bindParam(':id',  $id, PDO::PARAM_INT);
$stmt->execute();

echo json_encode(['success' => true, 'message' => 'Image updated']);
?>
