<?php

include "connect_db.php";
include "corsHeader.php";

try {
    $input = json_decode(file_get_contents("php://input"), true);
    $filters = $input["filters"];

    $query = "SELECT p.item_id AS item_id, p.item_name AS item_name, p.price AS price, p.item_condition AS item_condition, p.preview_pic AS preview_pic, u.user_id, u.profile_pic AS profile_pic, u.first_name AS first_name, u.last_name AS last_name 
    FROM posted_items p 
    JOIN users u ON p.user_id = u.user_id";

    $whereClauses = [];
    $categoryClauses = [];
    $conditionClauses = [];
    $priceClauses = [];
    $params = [];

    // Category filters
    $categoriesMap = [
        "books" => "Books & Study Materials",
        "electronics" => "Electronics",
        "furniture" => "Furniture & Home Essentials",
        "clothing" => "Clothing & Accessories",
        "transportation" => "Transportation",
        "food" => "Food & Drinks",
        "services" => "Services & Gigs",
        "tickets" => "Tickets & Events",
        "hobbies" => "Hobbies & Toys",
        "housing" => "Housing & Rentals",
        "health" => "Health & Beauty",
        "announcements" => "Announcements",
        "others" => "Others"
    ];

    foreach ($categoriesMap as $key => $value) {
        if (!empty($filters[$key])) {
            $param = ":$key";
            $categoryClauses[] = "p.category = $param";
            $params[$param] = $value;
        }
    }

    // Condition filters
    if (!empty($filters["new"])) {
        $conditionClauses[] = "p.item_condition = :new";
        $params[':new'] = 'New';
    }
    if (!empty($filters["likeNew"])) {
        $conditionClauses[] = "p.item_condition = :likeNew";
        $params[':likeNew'] = 'Like New';
    }
    if (!empty($filters["good"])) {
        $conditionClauses[] = "p.item_condition = :good";
        $params[':good'] = 'Good';
    }

    // Price range
    if (!empty($filters["minPrice"])) {
        $priceClauses[] = "p.price >= :minPrice";
        $params[':minPrice'] = $filters["minPrice"];
    }
    if (!empty($filters["maxPrice"])) {
        $priceClauses[] = "p.price <= :maxPrice";
        $params[':maxPrice'] = $filters["maxPrice"];
    }

    // Combine filter clauses
    if (!empty($categoryClauses)) {
        $whereClauses[] = "(" . implode(" OR ", $categoryClauses) . ")";
    }
    if (!empty($conditionClauses)) {
        $whereClauses[] = "(" . implode(" OR ", $conditionClauses) . ")";
    }
    if (!empty($priceClauses)) {
        $whereClauses[] = implode(" AND ", $priceClauses);
    }

    // Always filter for available status and if user is not banned
    $whereClauses[] = "p.status = 'AVAILABLE' AND u.is_banned = 0";

    if (!empty($whereClauses)) {
        $query .= " WHERE " . implode(" AND ", $whereClauses);
    }

    // Sorting logic
    $sortBy = $filters["sortBy"] ?? "newest";

    if ($sortBy === "lowToHigh") {
        $query .= " ORDER BY p.price ASC";
    } else if ($sortBy === "highToLow") {
        $query .= " ORDER BY p.price DESC";
    } else {
        // Default or based on date
        $query .= ($sortBy === "oldest") ? " ORDER BY p.listing_date ASC" : " ORDER BY p.listing_date DESC";
    }

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($results);

} catch (PDOException $e) {
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
?>
