<?php

    include "corsHeader.php";
    include "connect_db.php";


    try{
        $input = json_decode(file_get_contents("php://input"), true);
        $searchQuery = $input["search_query"];

        $query = "INSERT INTO search_history (item_name, user_id)
                  VALUES (:item_name, :user_id)";

        $stmt = $pdo->prepare($query);
        $result = $stmt->execute([
            ":item_name" => $searchQuery,
            ":user_id" => $_SESSION["user_id"],
        ]);

        if ($result){
            $response = ["status" => "Success", "message" => "Search Query Inserted"];
            echo json_encode($response);
        }

        else{
            throw new PDOException ("Failed to insert search query.");
        }

    }

    catch (PDOException $e){
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }





?>