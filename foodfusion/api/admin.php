<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/Recipe.php';
require_once __DIR__ . '/../includes/Event.php';
require_once __DIR__ . '/../includes/Resource.php';
require_once __DIR__ . '/../includes/User.php';

if (!User::isLoggedIn() || (($_SESSION['user_role'] ?? '') !== 'admin')) {
  http_response_code(403);
  echo json_encode(['success' => false, 'message' => 'Admin access required']);
  exit();
}

$recipe = new Recipe();
$event = new Event();
$resourceObj = new Resource();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$resource = $_GET['resource'] ?? $input['resource'] ?? '';

switch ($method) {
  case 'GET':
    if ($resource === 'recipes') {
      $filters = [
        'search' => $_GET['search'] ?? '',
        'status' => $_GET['status'] ?? ''
      ];
      echo json_encode($recipe->adminList($filters));
      exit();
    }
    if ($resource === 'events') {
      $filters = [
        'search' => $_GET['search'] ?? '',
        'status' => $_GET['status'] ?? ''
      ];
      echo json_encode($event->adminList($filters));
      exit();
    }

    if ($resource === 'resources') {
      $filters = [
        'search' => $_GET['search'] ?? '',
        'category' => $_GET['category'] ?? '',
        'type' => $_GET['type'] ?? ''
      ];
      echo json_encode($resourceObj->adminList($filters));
      exit();
    }

    echo json_encode(['success' => false, 'message' => 'Invalid resource']);
    break;

  case 'POST':
    if ($resource === 'recipe') {
      echo json_encode($recipe->adminCreate($input));
      exit();
    }
    if ($resource === 'event') {
      echo json_encode($event->adminCreate($input));
      exit();
    }

    if ($resource === 'resource') {
      echo json_encode($resourceObj->adminCreate($input));
      exit();
    }

    echo json_encode(['success' => false, 'message' => 'Invalid resource']);
    break;

  case 'PUT':
    if ($resource === 'recipe') {
      echo json_encode($recipe->adminUpdate($input));
      exit();
    }
    if ($resource === 'event') {
      echo json_encode($event->adminUpdate($input));
      exit();
    }

    if ($resource === 'resource') {
      echo json_encode($resourceObj->adminUpdate($input));
      exit();
    }

    echo json_encode(['success' => false, 'message' => 'Invalid resource']);
    break;

  case 'DELETE':
    if ($resource === 'recipe') {
      echo json_encode($recipe->adminDelete($input['recipe_id'] ?? null));
      exit();
    }
    if ($resource === 'event') {
      echo json_encode($event->adminDelete($input['event_id'] ?? null));
      exit();
    }

    if ($resource === 'resource') {
      echo json_encode($resourceObj->adminDelete($input['resource_id'] ?? null));
      exit();
    }

    echo json_encode(['success' => false, 'message' => 'Invalid resource']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
