<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST requests only.']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
$name = trim((string)($payload['name'] ?? ''));
$email = trim((string)($payload['email'] ?? ''));
$address = trim((string)($payload['address'] ?? ''));
$note = trim((string)($payload['note'] ?? ''));
$items = $payload['items'] ?? [];

if ($name === '' || $address === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !is_array($items) || count($items) === 0) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please provide valid customer details and at least one poster.']);
    exit;
}

$prices = ['A4' => 10, 'A3' => 15, 'A2' => 26, 'A1' => 40, 'A0' => 60];
$orderLines = [];
$total = 0;

foreach ($items as $item) {
    $title = trim((string)($item['title'] ?? 'Poster'));
    $size = strtoupper(trim((string)($item['size'] ?? '')));
    $quantity = filter_var($item['quantity'] ?? 0, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 20]]);

    if ($size === '' || !isset($prices[$size]) || !$quantity) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'One or more cart items are invalid.']);
        exit;
    }

    $lineTotal = $prices[$size] * $quantity;
    $total += $lineTotal;
    $orderLines[] = sprintf('%s | %s | Qty %d | $%0.2f', $title, $size, $quantity, $lineTotal);
}

$recipient = getenv('ORDER_EMAIL') ?: 'brooklynwangson@gmail.com';
$orderNumber = 'TB-' . strtoupper(bin2hex(random_bytes(4)));
$subject = 'New TopBoy Editions order ' . $orderNumber;
$message = "New poster order\n\n";
$message .= "Order: {$orderNumber}\nName: {$name}\nEmail: {$email}\nShipping address: {$address}\n\n";
$message .= "Items:\n- " . implode("\n- ", $orderLines) . "\n\nTotal: $" . number_format($total, 2) . "\n";
$message .= $note !== '' ? "\nCustomer note:\n{$note}\n" : '';
$headers = "From: TopBoy Editions <no-reply@topboystudios.lovestoblog.com>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (!mail($recipient, $subject, $message, $headers)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'The order could not be emailed. Please try again.']);
    exit;
}

echo json_encode(['success' => true, 'orderNumber' => $orderNumber]);
