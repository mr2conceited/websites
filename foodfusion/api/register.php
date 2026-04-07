<?php
/**
 * Registration API Endpoint
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/User.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    // Try form data if JSON fails
    $input = $_POST;
}

// Validate required fields
$required = ['first_name', 'last_name', 'email', 'password'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        echo json_encode([
            'success' => false,
            'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'
        ]);
        exit();
    }
}

// Validate email
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Create user object
$user = new User();
$user->first_name = $input['first_name'];
$user->last_name = $input['last_name'];
$user->email = $input['email'];
$user->password = $input['password'];
$user->profile_image = $input['profile_image'] ?? null;
$user->bio = $input['bio'] ?? null;

// Attempt registration
$result = $user->register();

echo json_encode($result);
?>