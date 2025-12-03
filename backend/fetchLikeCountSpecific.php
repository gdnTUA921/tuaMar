<?php
include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

try {
         
    $input = json_decode(file_get_contents("php://input"), true);
    $itemID = $input['item_id'];

    $query = "SELECT COUNT(*) AS like_count FROM liked_items WHERE item_id = :item_id";

    $stmt = $pdo ->prepare($query);
    $stmt ->execute([
        ':item_id' => $itemID,
    ]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

     echo json_encode($result);

}catch (Exception $e){
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
}

?>