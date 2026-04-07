<?php
/**
 * Contact API Endpoint
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/Contact.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    $input = $_POST;
}

// Check if it's a newsletter subscription
if (isset($input['newsletter']) && $input['newsletter'] == true) {
    if (empty($input['email'])) {
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        exit();
    }

    $contact = new Contact();
    $result = $contact->subscribeNewsletter($input['email'], $input['name'] ?? null);
    echo json_encode($result);
    exit();
}

// Regular contact form
$required = ['name', 'email', 'message'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
        exit();
    }
}

// Validate email
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

$contact = new Contact();
$result = $contact->saveMessage($input);

echo json_encode($result);
?>