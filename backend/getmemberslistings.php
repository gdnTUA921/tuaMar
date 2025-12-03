<?php
include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid user ID"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
	  SELECT 
		p.item_id,
		p.item_name,
		p.price,
		p.category,
		p.item_condition,
		p.status,
		p.listing_date,
		p.description,
		u.first_name,
		u.last_name,
		u.profile_pic,
		GROUP_CONCAT(i.itempic SEPARATOR '|') AS images
	  FROM posted_items p
	  JOIN users u ON p.user_id = u.user_id
	  LEFT JOIN item_pictures i ON p.item_id = i.item_id
	  WHERE p.user_id = :user_id
	  GROUP BY p.item_id
	  ORDER BY p.status ASC, p.listing_date DESC
	");


    $stmt->execute(['user_id' => $user_id]);
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);
	foreach ($listings as &$listing) {
		$listing['images'] = $listing['images'] ? explode('|', $listing['images']) : [];
	}
echo json_encode($listings);


} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
