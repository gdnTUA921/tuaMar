<?php
include "connect_db.php";
include "corsHeader.php";

header("Content-Type: application/json");

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Check for user_id
if (!isset($data['item_id']) || !is_numeric($data['item_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or missing item_id."]);
    exit;
}

$item_id = intval($data['item_id']);

try {

    if (isset($_SESSION['admin_id'])){
        $stmt = $pdo->prepare("DELETE FROM archivedeleted_items WHERE item_id = :item_id");
        $stmt->execute(['item_id' => $item_id]);

        if ($stmt->rowCount() > 0) {
            // server-side log
            try {
                $activity = "Permanently deleted archived item {$item_id}";
                $logStmt = $pdo->prepare("INSERT INTO admin_logs (`datetime`, `admin_id`, `activity`, `ip_address`) VALUES (NOW(), :admin_id, :activity, :ip_address)");
                $logStmt->execute([
                    ':admin_id' => $_SESSION['admin_id'] ?? null,
                    ':activity' => $activity,
                    ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? ''
                ]);
            } catch (Exception $e) { /* ignore */ }

            echo json_encode(["success" => true, "message" => "Successfully deleted item permanently."]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Item not found."]);
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
