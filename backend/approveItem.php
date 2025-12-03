<?php
include "connect_db.php"; // provides $pdo instance
include "corsHeader.php";

require __DIR__.'/vendor/autoload.php'; // Firebase Admin SDK autoload

use Kreait\Firebase\Factory;

// Path to your service account key (downloaded from Firebase Console → Service Accounts)
$serviceAccountPath = __DIR__ . '/tua-market-firebase-adminsdk-fbsvc-0bacb503ad.json';

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

// Decode JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["item_id"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing item_id"]);
    exit();
}

$item_id = intval($data["item_id"]);

try {
    // 1️⃣ Update MySQL status
    $stmt = $pdo->prepare("UPDATE posted_items SET status = 'AVAILABLE' WHERE item_id = ?");
    $stmt->execute([$item_id]);

    if ($stmt->rowCount() > 0) {

        // 2️⃣ Update Firebase chatsList
        $factory = (new Factory)
            ->withServiceAccount($serviceAccountPath)
            ->withDatabaseUri('https://tua-market-default-rtdb.asia-southeast1.firebasedatabase.app');

        $database = $factory->createDatabase();

        // Get all chats
        $chatsList = $database->getReference('chatsList')->getValue();

        $updates = [];
        if ($chatsList) {
            foreach ($chatsList as $chatKey => $chatData) {
                if (isset($chatData['item_id']) && (string)$chatData['item_id'] === (string)$item_id) {
                    $updates["$chatKey/item_status"] = "AVAILABLE";
                }
            }
        }

        if (!empty($updates)) {
            $database->getReference('chatsList')->update($updates);
        }

        echo json_encode(["success" => true, "message" => "Item approved successfully."]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Item not found or already approved."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to update item status: " . $e->getMessage()]);
} catch (\Throwable $t) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Firebase update failed: " . $t->getMessage()]);
}
