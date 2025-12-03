<?php

include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

try {

    //fetching pictures of specific item
    $input = json_decode(file_get_contents("php://input"), true);
    $userName = $input['user_name'];

    $query = "SELECT u.user_id, u.first_name, u.last_name, u.email, u.user_type, u.department, u.profile_pic, u.regDate, ROUND(AVG(l.rating), 1) AS ratingAvg, u.is_banned
              FROM users u LEFT JOIN leave_review l ON u.user_id = l.reviewed_user_id 
              WHERE CONCAT(u.first_name, ' ', u.last_name) = :user_name
              GROUP BY user_id";

    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':user_name'  => $userName,
    ]);

    $results = $stmt->fetch(PDO::FETCH_ASSOC);

    // Return results as JSON (array of objects)
    echo json_encode($results);
 } 
 
 catch (PDOException $e) {
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
 }


?>