<?php
include "connect_db.php";
include "corsHeader.php";

// Check if admin
if (!isset($_SESSION['admin_id']) && !isset($_SESSION['email'])) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

// Get status filter from query parameter
$status = isset($_GET['status']) ? $_GET['status'] : 'PENDING';

try {
    // Build query based on status filter
    if ($status === 'ALL') {
        $stmt = $pdo->prepare("
            SELECT * FROM pending_registrations 
            ORDER BY created_at DESC
        ");
        $stmt->execute();
    } else {
        $stmt = $pdo->prepare("
            SELECT * FROM pending_registrations 
            WHERE status = :status 
            ORDER BY created_at DESC
        ");
        $stmt->execute(['status' => $status]);
    }

    $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "registrations" => $registrations]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>