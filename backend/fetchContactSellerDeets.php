<?php


include "corsHeader.php";
include "connect_db.php";


header('Content-Type: application/json'); // Always set JSON header


try {
    $input = json_decode(file_get_contents("php://input"), true);


    if (!isset($input['sellerID']) || !isset($input['itemID'])) {
        echo json_encode(["error" => "Missing sellerID or itemID"]);
        exit;
    }


    $sellerID = $input['sellerID'];
    $itemID = $input['itemID'];


    $query = "SELECT CONCAT(u.first_name, ' ', u.last_name) AS fullName, u.profile_pic, u.fb_uid, u.user_id, p.item_name, p.price, p.preview_pic, p.status
              FROM `users` u JOIN posted_items p ON u.user_id = p.user_id  
              WHERE u.fb_uid = :sellerID and p.item_id = :itemID";


    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':sellerID' => $sellerID,
        ':itemID' => $itemID
    ]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);


    if ($result) {
        echo json_encode($result);
    } else {
        echo json_encode(["error" => "Failed to Fetch Seller Details."]);
    }
} catch (Exception $e) {
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>
