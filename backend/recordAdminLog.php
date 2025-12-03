<?php
include "connect_db.php";
include "corsHeader.php";

try {
    // Require admin session
    if (!isset($_SESSION['admin_id'])) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized - admin session required"]);
        exit();
    }

    // Parse JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON payload"]);
        exit();
    }

    // Convert frontend ISO datetime to MySQL DATETIME format
    $datetime = $input['datetime'] ?? date('Y-m-d H:i:s');
    if (isset($input['datetime'])) {
        $d = DateTime::createFromFormat(DateTime::ATOM, $input['datetime']); // ISO 8601
        if ($d) {
            $datetime = $d->format('Y-m-d H:i:s'); // MySQL DATETIME
        }
    }

    $admin_id = $_SESSION['admin_id'] ?? ($input['admin_id'] ?? null);
    $activity = $input['activity'] ?? '';
    $ip_address = $input['ip_address'] ?? ($_SERVER['REMOTE_ADDR'] ?? '');

    // Insert into database
    $stmt = $pdo->prepare("
        INSERT INTO admin_logs (datetime, admin_id, activity, ip_address) 
        VALUES (:datetime, :admin_id, :activity, :ip_address)
    ");

    $ok = $stmt->execute([
        ':datetime' => $datetime,
        ':admin_id' => $admin_id,
        ':activity' => $activity,
        ':ip_address' => $ip_address,
    ]);

    if ($ok) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to write log entry"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>