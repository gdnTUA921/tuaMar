<?php

    include "connect_db.php";
    include "corsHeader.php";

    
    try {

        if (!isset($_SESSION['user_id'])) {
            throw new Exception("Session does not contain user_id.");
        }

       $input = json_decode(file_get_contents("php://input"), true);

       $itemID = $input["item_id"];
       $itemName = $input["item_name"];
       $itemDescription = $input["item_description"];
       $itemCategory = $input["item_category"];
       $userID = $_SESSION['user_id'];
       

       $query = "INSERT INTO item_view_history (user_id, item_id, item_name, description, category)
                VALUES (:user_id, :item_id, :item_name, :description, :category);";

       $stmt = $pdo->prepare($query);

       $result = $stmt->execute([
            ":user_id" => $userID,
            ":item_id" => $itemID,
            ":item_name" => $itemName,
            ":description" => $itemDescription,
            ":category" => $itemCategory,
       ]);

       if ($result){
            $response = ["status" => "success", "message" => "View Logged Succcessfully"];
            echo json_encode($response);
       }

       else {
             throw new Exception("Failed to Log View History.");
       }

    }

    catch (Exception $e) {
        $response = ["status" => "Failed", "message" => "Error: " . $e->getMessage()];
        echo json_encode($response);
    }

?>