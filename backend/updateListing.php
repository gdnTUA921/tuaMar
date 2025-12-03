<?php
include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

$input = json_decode(file_get_contents("php://input"), true);

if (
    !empty($input['itemId']) &&
    !empty($input['itemName']) &&
    !empty($input['price']) &&
    !empty($input['category']) &&
    !empty($input['condition']) &&
    !empty($input['description']) &&
    !is_null($input['images']) &&
    is_array($input['images'])
) {
    $itemId = $input['itemId'];
    $itemName = $input['itemName'];
    $price = $input['price'];
    $category = $input['category'];
    $condition = $input['condition'];
    $description = $input['description'];
    $images = $input['images'];
    $userID = $_SESSION['user_id']; // this come from session data


    // Validate and check if there is at least one photo uploaded
    if (count($images) === 0) {
        $response = ["status" => "Failed", "message" => "At least one image URL is required."];
        echo json_encode($response);
        exit;
    }


    try {
        $pdo->beginTransaction();

        // Update item details
        $query = "UPDATE posted_items 
                  SET item_name = :item_name, price = :price, category = :category, item_condition = :condition, description = :description, preview_pic = :preview_pic, status = :status
                  WHERE user_id = :user_id AND item_id = :item_id";
        $stmt = $pdo->prepare($query);
        $result = $stmt->execute([
            ':item_name'   => $itemName,
            ':price'       => $price,
            ':category'    => $category,
            ':condition'   => $condition,
            ':description' => $description,
            ':preview_pic' => $images[0],
            ':status' => "IN REVIEW",
            ':user_id'     => $userID,
            ':item_id'     => $itemId,
        ]);

        if (!$result) {
            throw new Exception("Failed to update item.");
        }

        // Delete existing images
        $query2 = "DELETE FROM item_pictures WHERE item_id = :item_id";
        $stmt2 = $pdo->prepare($query2);
        if (!$stmt2->execute([':item_id' => $itemId])) {
            throw new Exception("Failed to delete old images.");
        }

        // Insert new images
        foreach ($images as $img) {
            $query3 = "INSERT INTO item_pictures (itempic, item_id) VALUES (:itempic, :item_id)";
            $stmt3 = $pdo->prepare($query3);
            if (!$stmt3->execute([':itempic' => $img, ':item_id' => $itemId])) {
                throw new Exception("Failed to insert image.");
            }
        }

        $pdo->commit();
        $response = ["message" => "Item updated successfully!"];
    } catch (Exception $e) {
        $pdo->rollBack();
        $response = ["message" => "Error: " . $e->getMessage()];
    }
} else {
    $response = ["message" => "Error: Missing or invalid item details."];
}

echo json_encode($response);
exit;