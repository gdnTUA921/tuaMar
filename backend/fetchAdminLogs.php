<?php
include "connect_db.php";
include "corsHeader.php";

try {
    if (!isset($_SESSION['admin_id'])) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized - admin session required"]);
        exit();
    }

    $stmt = $pdo->prepare('SELECT id, datetime, admin_id, activity, ip_address FROM admin_logs ORDER BY id DESC LIMIT 1000');
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($rows);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

?>
