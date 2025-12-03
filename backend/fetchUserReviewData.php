<?php

include "connect_db.php";
include "corsHeader.php";

try {

    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input["user_id"])) {

        $user_id = $input["user_id"];

        $query = "SELECT 
                    l.reviewer_id, 
                    CONCAT(u.first_name, ' ', u.last_name) AS userName, 
                    u.profile_pic, 
                    l.reviewer_status, 
                    l.rating, 
                    l.reviewText, 
                    l.images, 
                    l.time_stamp
                  FROM leave_review l 
                  JOIN users u ON l.reviewer_id = u.user_id
                  WHERE l.reviewed_user_id = :user_id
                  ORDER BY l.time_stamp DESC";

        $stmt = $pdo->prepare($query);
        $stmt->execute([
            ":user_id" => $user_id
        ]);

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Decode the images JSON string into arrays
        foreach ($result as &$review) {
            $review['images'] = json_decode($review['images'], true); // Convert JSON string to PHP array
        }

        echo json_encode($result);
    } else {
        throw new Exception("Failed to fetch review data.");
    }

} catch (Exception $e) {
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
?>
