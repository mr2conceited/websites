<?php
require_once 'config/database.php';
$db = new Database();
$result = $db->testConnection();
echo json_encode($result);
?>