<?php

include "connect_db.php";
include "corsHeader.php";  
header("Content-Type: application/json");  // Set the response content type to JSON

// Read input data from the request body
$input = json_decode(file_get_contents("php://input"), true);



// Extract values from the input data
$user_id = intval($input['user_id']);
$item_id = intval($input['item_id']);
$liked = boolval($input['liked']);

try {

    $stmt = $pdo ->prepare("SELECT item_name, description, category, preview_pic FROM posted_items WHERE item_id = :item_id");
    $stmt ->bindParam('item_id', $item_id, PDO::PARAM_INT);
    $stmt->execute();

    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    $item_name = $item['item_name'];
    $description = $item['description'];
    $category = $item['category'];
    $previewpic = $item['preview_pic'];

    if ($liked) {
        // If liked is true, insert a new record into liked_items table
        // ':' this is used for placeholder
        $stmt = $pdo->prepare("INSERT IGNORE INTO liked_items (user_id, item_id, item_name, description, category, preview_pic) VALUES (:user_id, :item_id, :item_name, :description, :category, :previewpic)");
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':item_id', $item_id, PDO::PARAM_INT);
        $stmt->bindParam(':item_name', $item_name, PDO::PARAM_STR);
        $stmt->bindParam(':description', $description, PDO::PARAM_STR);
        $stmt->bindParam(':category', $category, PDO::PARAM_STR);
        $stmt->bindParam(':previewpic', $previewpic, PDO::PARAM_STR);
        $stmt->execute();

        echo json_encode(["status" => "liked", "message" => "Item liked successfully"]);
    } else {
        // If liked is false, delete the record from liked_items table
        $stmt = $pdo->prepare("DELETE FROM liked_items WHERE user_id = :user_id AND item_id = :item_id");
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':item_id', $item_id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(["status" => "unliked", "message" => "Item unliked successfully"]);
    }
} catch (PDOException $e) {
    // Handle database errors and return a JSON error message
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?> 