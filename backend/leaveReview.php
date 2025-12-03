<?php
include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";


try {

    $input = json_decode(file_get_contents("php://input"), true);

    $reviewerID = $_SESSION["user_id"];
    $reviewerStatus = $input["reviewerStatus"];
    $itemID = $input["item_id"];
    $reviewedUserID = $input["reviewedUserID"];
    $rating = $input["rating"];
    $reviewText = $input["reviewText"];
    $images = $input["images"] ?? []; // Optional, default to empty array if not provided
    
    
    if (!$rating || !$reviewText || !$itemID) {
        echo json_encode(["message" => "Missing required fields"]);
        exit;
    }

    $query = "INSERT INTO `leave_review` (`reviewer_id`, `reviewer_status`, `item_id`, `reviewed_user_id`, `rating`, `reviewText`, `images`, `time_stamp`) 
              VALUES (:reviewer_id, :reviewer_status, :item_id, :reviewed_user_id, :rating, :reviewText, :images, NOW())";


    $stmt =$pdo->prepare($query);
    $stmt->execute([
        ':reviewer_id' => $reviewerID,
        ':reviewer_status' => $reviewerStatus,
        ':item_id' => $itemID,
        ':reviewed_user_id' => $reviewedUserID,
        ':rating' => $rating,
        ':reviewText' => $reviewText,
        ':images' => json_encode($images) // Store images as JSON string
    ]);

        echo json_encode(["message" => "Review submitted successfully"]);


} catch (PDOException $e) {
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}










?>
