<?php

include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";


try {

    //fetching pictures of specific item
    $input = json_decode(file_get_contents("php://input"), true);
    $userName = $input['user_name'];


    $query = "SELECT p.item_id AS item_id, p.item_name AS item_name, p.price AS price, p.item_condition AS item_condition, p.preview_pic AS preview_pic, p.status AS status
    FROM posted_items p 
    LEFT JOIN users u ON p.user_id = u.user_id
    WHERE CONCAT(u.first_name, ' ', u.last_name) = :user_name AND (p.status != 'UNLISTED' AND p.status != 'IN REVIEW')
    ORDER BY p.status ASC, p.listing_date DESC";


    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':user_name'  => $userName,
    ]);


    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // Return results as JSON (array of objects)
    echo json_encode($results);
 }
 
 catch (PDOException $e) {
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
 }



?>
