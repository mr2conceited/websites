<?php
$page_title = $page_title ?? 'FoodFusion';
$page_desc  = $page_desc  ?? 'A community of food lovers sharing recipes, tips, and experiences.';
$body_class = $body_class ?? 'page-' . preg_replace('/[^a-z0-9]+/', '-', strtolower(trim($page_title)));
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($page_title) ?> — FoodFusion</title>
  <meta name="description" content="<?= htmlspecialchars($page_desc) ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/foodfusion/assets/css/style.css">
</head>
<body class="<?= htmlspecialchars($body_class) ?>">

<!-- Navigation -->
<nav class="navbar">
  <div class="container nav-inner">
    <div class="nav-island nav-links-island">
      <ul class="nav-links">
        <li><a href="/foodfusion/">Home</a></li>
        <li><a href="/foodfusion/recipes.php">Recipes</a></li>
        <li><a href="/foodfusion/culinary-resources.php">Culinary Resources</a></li>
        <li><a href="/foodfusion/renewable-energy.php">Renewable Energy</a></li>
        <li><a href="/foodfusion/community.php">Community</a></li>
        <li><a href="/foodfusion/events.php">Events</a></li>
        <li><a href="/foodfusion/contact.php">Contact</a></li>
      </ul>
    </div>

    <div class="nav-island nav-auth-island">
      <div class="nav-user-block">
        <span class="nav-user-icon"><i class="fas fa-user"></i></span>
        <span id="nav-user-name"></span>
      </div>
      <a id="nav-login"    class="btn btn-ghost btn-sm"   href="/foodfusion/login.php">Log in</a>
      <a id="nav-register" class="btn btn-primary btn-sm" href="/foodfusion/register.php">Sign up</a>
      <a id="nav-admin" class="btn btn-ghost btn-sm hidden" href="/foodfusion/admin.php">Dashboard</a>
      <button id="nav-logout" class="btn btn-ghost btn-sm hidden">Log out</button>
    </div>
  </div>
</nav>
