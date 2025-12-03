<?php

include "connect_db.php";
include "corsHeader.php";

try {
    $query = "
        SELECT 
            p.item_id,
            p.item_name,
            p.price,
            p.item_condition,
            p.description,
            p.status,
            p.preview_pic,
            p.listing_date,
            u.user_id,
            u.profile_pic,
            u.first_name,
            u.last_name,
            GROUP_CONCAT(ip.itempic SEPARATOR '|') AS images
        FROM posted_items p
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN item_pictures ip ON p.item_id = ip.item_id
        WHERE p.status = 'IN REVIEW'
        GROUP BY p.item_id
        ORDER BY p.listing_date DESC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Split concatenated image strings into arrays
    foreach ($results as &$item) {
        $item['images'] = $item['images'] ? explode('|', $item['images']) : [];
    }

    echo json_encode($results);

} catch (PDOException $e) {
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
?>
