<?php
include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

try {
         

    $query = "SELECT * FROM liked_items l JOIN posted_items p ON p.item_id = l.item_id JOIN users u ON u.user_id = p.user_id WHERE l.user_id = :user_id AND u.is_banned = 0 AND p.status != 'UNLISTED' ORDER BY liked_at DESC";

    $stmt = $pdo ->prepare($query);
    $stmt ->execute([
        ':user_id' => $_SESSION["user_id"],
    ]);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

     echo json_encode($result);

}catch (Exception $e){
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
}

?>