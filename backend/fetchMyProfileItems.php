<?php

include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "User not authenticated."]);
    exit;
}

try {

    $query = "SELECT p.item_id AS item_id, p.item_name AS item_name, p.price AS price, p.item_condition AS item_condition, p.preview_pic AS preview_pic, p.status AS status
    FROM posted_items p 
    WHERE p.user_id = :user_id AND p.status != 'UNLISTED'
    ORDER BY p.status ASC, p.listing_date DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':user_id'  => $_SESSION["user_id"],
    ]);

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return results as JSON (array of objects)
    echo json_encode($results);
 } 
 
 catch (PDOException $e) {
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
 }


?>