<?php 

include "connect_db.php";
include "corsHeader.php";

$input = json_decode(file_get_contents("php://input"), true);


if (isset($input["itemStatus"]) && isset($input["itemId"])){

    $itemStatus = $input["itemStatus"];
    $itemId = $input["itemId"];


    try{

        $query = "UPDATE posted_items SET status = :itemStatus WHERE item_id = :itemId";

        $stmt = $pdo->prepare($query);

        $result = $stmt->execute([
            'itemStatus' => strtoupper($itemStatus),
            'itemId' => $itemId,
        ]);


        if($result){

            $response = [
                "updateStatus" => "success",
                "message" => strtoupper($itemStatus),
            ];
        }

        else {
            throw new Exception("Failed to Mark it as Sold.");
        }

    }

    catch (Exception $e) {
        $response = [
            "updateStatus" => "failed",
            "message" => "Error: " . $e->getMessage(),
        ];
    }
    
    echo json_encode($response);
}

else {
    $response = [
      "updateStatus" => "failed",
      "message" => "Failed to Update Listing Status.",
    ];

    echo json_encode($response);
    
}





?>