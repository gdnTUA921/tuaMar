<?php

    try {
        include "corsHeader.php";
        include "connect_db.php";

        $query = "SELECT user_id AS id, CONCAT(first_name, ' ', last_name) AS name, user_type AS type FROM users WHERE is_banned = 1";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($result) {
                echo json_encode($result);
            } 
            
            else {
                throw new Exception("List of Users not found.");
            }

    } 
    
    catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
