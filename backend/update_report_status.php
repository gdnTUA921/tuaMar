<?php

// Set CORS and content headers and session start
include "corsHeader.php";

// Include database connection
include "connect_db.php";

// Accept only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["message" => "Only POST requests are allowed"]);
    exit;
}

// Read the raw input
$rawInput = file_get_contents("php://input");
$input = json_decode($rawInput, true);

// Handle invalid JSON
if (!is_array($input)) {
    echo json_encode([
        "message" => "Invalid or missing JSON input",
        "raw_input" => $rawInput,
        "request_method" => $_SERVER['REQUEST_METHOD'],
        "content_type" => $_SERVER['CONTENT_TYPE'] ?? '(not set)'
    ]);
    exit;
}

// Validate required fields
if (empty($input["report_id"]) || empty($input["status"])) {
    echo json_encode(["message" => "Missing required fields"]);
    exit;
}

$reportID = $input["report_id"];
$newStatus = $input["status"];

try {
    $query = "UPDATE all_reports SET status = :status WHERE report_id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ":status" => $newStatus,
        ":id" => $reportID
    ]);

    // write admin audit record if admin session exists (best-effort)
    try {
        if (isset($_SESSION['admin_id'])) {
            $activity = "Updated report {$reportID} status to {$newStatus}";
            $logStmt = $pdo->prepare("INSERT INTO admin_logs (`datetime`, `admin_id`, `activity`, `ip_address`) VALUES (NOW(), :admin_id, :activity, :ip_address)");
            $logStmt->execute([
                ':admin_id' => $_SESSION['admin_id'],
                ':activity' => $activity,
                ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? ''
            ]);
        }
    } catch (Exception $e) {
        // ignore logging failure
    }

    echo json_encode(["message" => "Status updated"]);
} catch (PDOException $e) {
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
file_put_contents("debug.log", $rawInput . PHP_EOL, FILE_APPEND);
?>