<?php
include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

try {
         
    $input = json_decode(file_get_contents("php://input"), true);
    $itemID = $input['item_id'];

    $query = "SELECT * FROM liked_items l JOIN posted_items p ON p.item_id = l.item_id JOIN users u ON u.user_id = p.user_id WHERE l.user_id = :user_id AND l.item_id = :item_id";

    $stmt = $pdo ->prepare($query);
    $stmt ->execute([
        ':user_id' => $_SESSION["user_id"],
        ':item_id' => $itemID,
    ]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

     echo json_encode($result);

}catch (Exception $e){
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
}

?>