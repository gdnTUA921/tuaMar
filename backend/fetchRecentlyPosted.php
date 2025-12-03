<?php

    include "corsHeader.php";
    include "connect_db.php";


    try{

        $query = "SELECT p.item_id, p.item_name, p.price, p.item_condition, p.preview_pic, u.first_name, u.last_name, u.profile_pic, u.user_id
                  FROM posted_items p
                  JOIN users u ON p.user_id = u.user_id
                  WHERE p.status = 'AVAILABLE' AND p.listing_date >= NOW() - INTERVAL 15 DAY AND u.is_banned = 0
                  ORDER BY p.listing_date DESC LIMIT 20;";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute();

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($result){
            echo json_encode($result);
        }

        else {
            throw new PDOException ("Failed to Fetch Recently Posted Listings.");
        }
    }

    catch (PDOException $e){
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }





?>