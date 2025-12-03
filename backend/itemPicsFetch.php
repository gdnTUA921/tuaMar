<?php

include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

try {

    //fetching pictures of specific item
    $input = json_decode(file_get_contents("php://input"), true);
    $itemID = $input['item_id'];

    $query = "SELECT itempic FROM item_pictures WHERE item_id = :item_id";

    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':item_id'   => $itemID,
    ]);

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Storing the pics into an array before json_encode
    $pics = array_map(function($row) {
        return [
            'image'   => $row['itempic'] 
        ];
    }, $results);

    // Return results as JSON (array of objects)
    echo json_encode($pics);
 } 
 
 catch (PDOException $e) {
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
 }


?>