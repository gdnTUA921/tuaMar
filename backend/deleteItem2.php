<?php
include "connect_db.php";
include "corsHeader.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->item_id)) {
        $item_id = $data->item_id;

        try {
            $query = "UPDATE posted_items SET status = 'UNLISTED' WHERE item_id = :item_id";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':item_id', $item_id, PDO::PARAM_INT);
            $stmt->execute();

            // server-side audit log
            try {
                $activity = "Set item {$item_id} status to UNLISTED";
                $logStmt = $pdo->prepare("INSERT INTO admin_logs (`datetime`, `admin_id`, `activity`, `ip_address`) VALUES (NOW(), :admin_id, :activity, :ip_address)");
                $logStmt->execute([
                    ':admin_id' => $_SESSION['admin_id'] ?? null,
                    ':activity' => $activity,
                    ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? ''
                ]);
            } catch (Exception $e) { /* ignore */ }

            echo json_encode(["success" => true, "message" => "Item deleted"]);
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Missing item_id"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}