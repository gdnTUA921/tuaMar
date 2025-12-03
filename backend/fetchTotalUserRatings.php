<?php

include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

try {
    $period = isset($_GET['period']) ? $_GET['period'] : 'overall';
    $week = isset($_GET['week']) ? intval($_GET['week']) : null;
    $month = isset($_GET['month']) ? intval($_GET['month']) : null;
    $year = isset($_GET['year']) ? intval($_GET['year']) : null;

    $whereClause = "WHERE 1=1";

    if ($period === 'week') {
        if ($week !== null) {
            $whereClause .= " AND WEEK(created_at, 1) = WEEK(MAKEDATE(YEAR(NOW()), 1) + INTERVAL ($week - 1) WEEK, 1)";
            $whereClause .= " AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())";
        } else {
            $whereClause .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        }
    } elseif ($period === 'month') {
        if ($month !== null) {
            $whereClause .= " AND MONTH(created_at) = $month";
            $whereClause .= $year !== null ? " AND YEAR(created_at) = $year" : " AND YEAR(created_at) = YEAR(NOW())";
        } else {
            $whereClause .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        }
    } elseif ($period === 'year') {
        if ($year !== null) {
            $whereClause .= " AND YEAR(created_at) = $year";
        } else {
            $whereClause .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
        }
    }

    $query = "SELECT COUNT(rating_id) as total_ratings FROM user_ratings $whereClause";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode($result);
    } else {
        throw new Exception("Failed to fetch user ratings count");
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

?>