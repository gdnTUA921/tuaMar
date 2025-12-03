<?php

include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

$input = json_decode(file_get_contents("php://input"), true);

if (
    !empty($input['itemName']) &&
    !empty($input['price']) &&
    !empty($input['category']) &&
    !empty($input['condition']) &&
    !empty($input['description']) &&
    !is_null($input['images']) &&
    is_array($input['images'])
) {
    $itemName = $input['itemName'];
    $price = $input['price'];
    $category = $input['category'];
    $condition = $input['condition'];
    $description = $input['description'];
    $images = $input['images'] ?? [];
    $userID = $_SESSION['user_id']; // this come from session data


    // Validate and check if there is at least one photo uploaded
    if (count($images) === 0) {
        $response = ["status" => "Failed", "message" => "At least one image URL is required."];
        echo json_encode($response);
        exit;
    }
    

    try {
        // Insert main item
        $query = "INSERT INTO posted_items (item_name, price, category, item_condition, description, user_id, preview_pic, status) 
                VALUES (:item_name, :price, :category, :condition, :description, :user_id, :preview_pic, :status)";
        $stmt = $pdo->prepare($query);

        $result = $stmt->execute([
            ':item_name'   => $itemName,
            ':price'       => $price,
            ':category'    => $category,
            ':condition'   => $condition,
            ':description' => $description,
            ':user_id'     => $userID,
            ':preview_pic' => $images[0],
            ':status' => "IN REVIEW"
        ]);

        // Get the inserted item ID
        $itemId = $pdo->lastInsertId();

        $imgUploadResult = [];

        if ($result && $itemId) {
            // Insert associated images
            foreach ($images as $img) {
                $query2 = "INSERT INTO item_pictures (itempic, item_id) 
                        VALUES (:itempic, :item_id)";
                $stmt2 = $pdo->prepare($query2);

                $result2 = $stmt2->execute([
                    ':itempic'  => $img,
                    ':item_id'   => $itemId
                ]);

                if ($result2) {
                    $imgUploadResult[] = true;
                }
            }

            if (count($imgUploadResult) === count($images)) {
                $response = ["status" => "Success", "message" => "Item posted successfully!"];
            } else {
                $response = ["status" => "Failed", "message" => "Item saved, but some images failed to upload."];
            }
        } else {
            $response = ["status" => "Failed", "message" => "Failed to insert item."];
        }
    } catch (PDOException $e) {
        $response = ["status" => "Failed", "message" => "Database error: " . $e->getMessage()];
    }
} else {
    $response = ["status" => "Failed", "message" => "Error: Missing or invalid item details."];
}

echo json_encode($response);
exit;
