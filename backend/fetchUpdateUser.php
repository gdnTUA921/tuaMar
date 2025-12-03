<?php

include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";

try {

    //fetching pictures of specific item
    $input = json_decode(file_get_contents("php://input"), true);
    $userID = $input['user_id'];

    $query = "SELECT id_number, first_name, last_name, email, user_type, department FROM users
              WHERE u.user_id = :user_id;";

    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':user_id'  => $userID,
    ]);

    $results = $stmt->fetch(PDO::FETCH_ASSOC);

    // Return results as JSON (array of objects)
    echo json_encode($results);
 } 
 
 catch (PDOException $e) {
     echo json_encode(["message" => "Error: " . $e->getMessage()]);
 }


?>