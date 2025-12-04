<?php
include "connect_db.php";
include "corsHeader.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

try {
    if (!isset($_SESSION['admin_id'])) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized - admin session required"]);
        exit();
    }

    // Clear all admin logs from the database
    $stmt = $pdo->prepare('DELETE FROM admin_logs');
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Admin logs cleared successfully"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>