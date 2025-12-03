<?php

include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

try {
    $input = json_decode(file_get_contents("php://input"), true);
   
    // Check if the expected keys are available
    $category = $input["category"];  
    $description = $input["description"];  
    $reporterID = $_SESSION["user_id"];
    $reported_id = $input["reportedUserId"];
    $images = $input["images"] ?? [];


    // Ensure all fields are provided
    if (!$category || !$description) {
        echo json_encode(["message" => "Missing required fields"]);
        exit;
    }

    // Corrected query
    $query = "INSERT INTO `all_reports`(`report_type`, `reported_id`, `report_desc`, `user_id`, `report_reason`, `images`, `reported_at`, `status`)
              VALUES (:report_type, :reported_id, :report_desc, :user_id, :report_reason, :images, NOW(), :status)";


    // Prepare and execute the statement
    $stmt = $pdo->prepare($query);
    $result = $stmt->execute([
                ':report_type' => "user",
                ':reported_id' => $reported_id,
                ':report_desc' => $description,
                ':user_id' => $reporterID,
                ':report_reason' => $category,
                ':status' => "PENDING",
                ':images' => json_encode($images)
            ]);


    if ($result){
        echo json_encode(["message" => "Report submitted successfully"]);
    }
    else {
        throw new PDOException ("Failed to insert.");
    }


} catch (PDOException $e) {
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>
