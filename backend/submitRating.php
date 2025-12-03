<?php
include "connect_db.php";
include "corsHeader.php";
session_start();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$userId = $_SESSION['user_id'];
$rating = $data['rating'] ?? null;
$feedback = $data['feedback'] ?? '';

// Validate rating
if ($rating === null || $rating < 1 || $rating > 5) {
    echo json_encode(["success" => false, "message" => "Invalid rating value"]);
    exit();
}

try {
    // Check if user has already rated
    $stmt = $pdo->prepare("SELECT rating_id FROM user_ratings WHERE user_id = ?");
    $stmt->execute([$userId]);
    
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "You have already submitted a rating"]);
        exit();
    }

    // Insert the rating
    $stmt = $pdo->prepare("
        INSERT INTO user_ratings (user_id, rating, feedback, created_at) 
        VALUES (?, ?, ?, NOW())
    ");
    
    $stmt->execute([$userId, $rating, $feedback]);

    echo json_encode([
        "success" => true, 
        "message" => "Rating submitted successfully"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>