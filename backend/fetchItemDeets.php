<?php

include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

try {

    //fetching pictures of specific item
    $input = json_decode(file_get_contents("php://input"), true);
    $itemID = $input['item_id'];
    $itemName = $input['item_name'];

    $query = "SELECT p.item_name AS itemName, p.price AS price, p.category AS category, p.item_condition AS item_condition, p.description AS description, p.status AS status,
    u.first_name AS firstName, u.last_name AS lastName, u.email AS email, u.profile_pic AS profilePic, u.user_id AS user_id, u.fb_uid AS fb_uid, ROUND(AVG(l.rating), 1) AS ratingAvg
    FROM posted_items p JOIN users u ON p.user_id = u.user_id LEFT JOIN leave_review l ON p.user_id = l.reviewed_user_id
    WHERE p.item_id = :item_id AND p.item_name = :item_name AND u.is_banned = 0";

    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':item_id'   => $itemID,
        ':item_name'   => $itemName

    ]);

    $results = $stmt->fetch(PDO::FETCH_ASSOC);

    // Return results as JSON (array of objects)
    echo json_encode($results);
 } 
 
 catch (PDOException $e) {
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
 }


?>
