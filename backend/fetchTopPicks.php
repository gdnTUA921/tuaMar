<?php

    include "corsHeader.php";
    include "connect_db.php";

    try{

        $query = "SELECT p.item_id, p.item_name, p.price, p.item_condition, p.preview_pic, u.first_name, u.last_name, u.profile_pic, u.user_id, COUNT(l.item_id) AS likes
                FROM posted_items p
                JOIN users u ON p.user_id = u.user_id
                LEFT JOIN liked_items l ON l.item_id = p.item_id
                WHERE p.status = 'AVAILABLE' AND l.liked_at >= NOW() - INTERVAL 7 DAY AND u.is_banned = 0
                GROUP BY p.item_id
                ORDER BY likes DESC
                LIMIT 10;";

        $stmt = $pdo->prepare($query);
        $stmt->execute();

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);


        if ($result){
            echo json_encode($result);
        }

        else{
            throw new PDOException ("Failed to fetch most liked items");
        }

    }

    catch (PDOException $e){
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }


?>