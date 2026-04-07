<?php
/**
 * Recipes API Endpoint
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/Recipe.php';
require_once __DIR__ . '/../includes/User.php';

$recipe = new Recipe();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get recipes with filters
        $filters = [];
        
        if (isset($_GET['cuisine'])) {
            $filters['cuisine'] = $_GET['cuisine'];
        }
        if (isset($_GET['difficulty'])) {
            $filters['difficulty'] = $_GET['difficulty'];
        }
        if (isset($_GET['search'])) {
            $filters['search'] = $_GET['search'];
        }
        if (isset($_GET['user_id'])) {
            $filters['user_id'] = $_GET['user_id'];
        }
        if (isset($_GET['featured']) && $_GET['featured'] == 'true') {
            $result = $recipe->getFeaturedRecipes($_GET['limit'] ?? 6);
            echo json_encode($result);
            exit();
        }
        
        $limit = $_GET['limit'] ?? 12;
        $offset = $_GET['offset'] ?? 0;
        
        if (isset($_GET['id'])) {
            // Get single recipe
            $result = $recipe->getRecipeById($_GET['id']);
        } else {
            // Get all recipes
            $result = $recipe->getAllRecipes($filters, $limit, $offset);
        }
        
        echo json_encode($result);
        break;

    case 'POST':
        // Create new recipe (requires login)
        if (!User::isLoggedIn()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Please login to create recipes']);
            exit();
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            $input = $_POST;
        }

        // Validate required fields
        $required = ['title', 'description', 'ingredients', 'instructions', 'cuisine_type', 'difficulty_level'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
                exit();
            }
        }

        // Add user_id from session
        $input['user_id'] = $_SESSION['user_id'];

        $result = $recipe->createRecipe($input);
        echo json_encode($result);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>