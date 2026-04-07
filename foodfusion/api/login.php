<?php
/**
 * Login API Endpoint
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/User.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    $input = $_POST;
}

// Validate required fields
if (empty($input['email']) || empty($input['password'])) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit();
}

// Create user object
$user = new User();
$user->email = $input['email'];
$user->password = $input['password'];

// Attempt login
$result = $user->login();

// If admin login is requested, enforce admin role
$wants_admin = !empty($input['admin_login']);
if ($wants_admin && (!($result['success'] ?? false) || ($result['user']['role'] ?? '') !== 'admin')) {
    // Clear session if a non-admin logged in
    if (session_status() === PHP_SESSION_ACTIVE) {
        $_SESSION = [];
        session_destroy();
    }
    echo json_encode(['success' => false, 'message' => 'Admin credentials required']);
    exit();
}

echo json_encode($result);
?>
