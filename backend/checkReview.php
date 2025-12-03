<?php

include "corsHeader.php";
include "connect_db.php";

try {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input["itemId"], $input["reviewed_user_id"], $_SESSION["user_id"])) {
        throw new Exception("Missing required data.");
    }

    $itemId = $input["itemId"];
    $reviewed_user_id = $input["reviewed_user_id"];
    $reviewer_id = $_SESSION["user_id"];


    $query = "SELECT COUNT(rating) AS review_count FROM leave_review 
              WHERE item_id = :itemId AND reviewer_id = :reviewer_id AND reviewed_user_id = :reviewed_user_id";
    $stmt = $pdo->prepare($query);


    $stmt->execute([
        ":itemId" => $itemId,
        ":reviewer_id" => $reviewer_id,
        ":reviewed_user_id" => $reviewed_user_id,
    ]);


    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $count = (int) $result['review_count'];


    if ($count === 0) {
        $response = ["message" => "No Reviews Yet"];
    } 
    else {
        $response = ["message" => "A Review Has Been Made"];
    }

    echo json_encode($response);

} 

catch (PDOException $e) {
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
} 

catch (Exception $e) {
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}

?>
