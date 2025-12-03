<?php

include "connect_db.php";
include "corsHeader.php";

try {
    $query = "
        SELECT 
            a.item_id,
            a.item_name,
            a.price,
            a.item_condition,
            a.description,
            a.status,
            a.preview_pic,
            a.listing_date,
            a.reason,
            u.user_id,
            u.profile_pic,
            u.first_name,
            u.last_name,
            GROUP_CONCAT(ip.itempic SEPARATOR '|') AS images
        FROM archivedeleted_items a
        JOIN users u ON a.user_id = u.user_id
        LEFT JOIN item_pictures ip ON a.item_id = ip.item_id
        GROUP BY a.item_id
        ORDER BY a.listing_date DESC
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
