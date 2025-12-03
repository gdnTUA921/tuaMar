<?php
include "connect_db.php";
include "corsHeader.php";

header("Content-Type: application/json");

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Check for user_id
if (!isset($data['user_id']) || !is_numeric($data['user_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or missing user_id."]);
    exit;
}

$user_id = intval($data['user_id']);

try {

    if (isset($_SESSION['admin_id'])){
        $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $user_id]);

        if ($stmt->rowCount() > 0) {
            try {
                $activity = "Permanently deleted user {$user_id}";
                $logStmt = $pdo->prepare("INSERT INTO admin_logs (`datetime`, `admin_id`, `activity`, `ip_address`) VALUES (NOW(), :admin_id, :activity, :ip_address)");
                $logStmt->execute([
                    ':admin_id' => $_SESSION['admin_id'] ?? null,
                    ':activity' => $activity,
                    ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? ''
                ]);
            } catch (Exception $e) { /* ignore */ }

            echo json_encode(["success" => true, "message" => "Successfully deleted user permanently."]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "User not found."]);
        }
    }

    else {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized. Admin access required."]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
