<?php
include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

try {
         
    $input = json_decode(file_get_contents("php://input"), true);
    $listings = $input['myListings'];

    $likeCounts = [];

    foreach ($listings as $item) {

        if (isset($item['item_id'])){
            $query = "SELECT COUNT(*) AS like_count FROM liked_items WHERE item_id = :item_id";

            $stmt = $pdo ->prepare($query);
            $stmt ->execute([
                ':item_id' => $item['item_id']
            ]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $likeCounts[$item['item_id']] = (int)$result['like_count'];
        }
    }

     echo json_encode($likeCounts);

}catch (Exception $e){
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
}

?>