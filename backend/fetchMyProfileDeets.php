<?php

include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

try {

    $query = "SELECT u.user_id, u.first_name, u.last_name, u.email, u.user_type, u.department, u.profile_pic, u.regDate, ROUND(AVG(l.rating), 1) AS ratingAvg 
              FROM users u LEFT JOIN leave_review l ON u.user_id = l.reviewed_user_id 
              WHERE u.user_id = :user_id;";

    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':user_id'  => $_SESSION["user_id"],
    ]);

    $results = $stmt->fetch(PDO::FETCH_ASSOC);

    // Return results as JSON (array of objects)
    echo json_encode($results);
 } 
 
 catch (PDOException $e) {
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
 }


?>