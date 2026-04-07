<?php
/**
 * File Upload API Endpoint
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

if (!User::isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please login to upload files']);
    exit();
}

// Check if file was uploaded
if (!isset($_FILES['file'])) {
    echo json_encode(['success' => false, 'message' => 'No file uploaded']);
    exit();
}

$file = $_FILES['file'];
$kind = $_GET['kind'] ?? ($_POST['kind'] ?? 'image');
$upload_dir = __DIR__ . '/../uploads/';

// Create upload directory if it doesn't exist
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid() . '_' . time() . '.' . $extension;
$target_path = $upload_dir . $filename;

// Allowed file types
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$max_size = 5 * 1024 * 1024; // 5MB
if ($kind === 'video') {
    $allowed_types = ['video/mp4', 'video/webm', 'video/ogg'];
    $max_size = 50 * 1024 * 1024; // 50MB
}

// Validate file type
if (!in_array($file['type'], $allowed_types)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Allowed: JPG, PNG, GIF, WEBP (images) or MP4/WEBM/OGG (videos)']);
    exit();
}

// Validate file size
if ($file['size'] > $max_size) {
    echo json_encode(['success' => false, 'message' => 'File too large. Maximum size is 5MB']);
    exit();
}

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $target_path)) {
    // Generate URL for the uploaded file
    $file_url = '/foodfusion/uploads/' . $filename;
    
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'file_path' => $file_url,
        'file_name' => $filename
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
}
?>