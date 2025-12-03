<?php

include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

try {

    //fetching items

    $query = "SELECT p.item_id AS item_id, p.item_name AS item_name, p.price AS price, p.item_condition AS item_condition, p.preview_pic AS preview_pic, u.user_id, u.profile_pic AS profile_pic, u.first_name AS first_name, u.last_name AS last_name 
    FROM posted_items p 
    JOIN users u ON p.user_id = u.user_id 
    WHERE p.status = 'AVAILABLE' AND u.is_banned = 0
    ORDER BY listing_date DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return results as JSON (array of objects)
    echo json_encode($results);
 } 
 
 catch (PDOException $e) {
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
 }


?>