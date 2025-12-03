<?php
include "connect_db.php";
include "corsHeader.php";

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["has_rated" => false]);
    exit();
}

$userId = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM user_ratings WHERE user_id = ?");
    $stmt->execute([$userId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "has_rated" => $result['count'] > 0
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "has_rated" => false,
        "error" => $e->getMessage()
    ]);
}
?>