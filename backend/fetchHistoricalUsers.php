<?php

include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

try {
    $period = isset($_GET['period']) ? $_GET['period'] : 'overall';
    $week = isset($_GET['week']) ? intval($_GET['week']) : null;
    $month = isset($_GET['month']) ? intval($_GET['month']) : null;
    $year = isset($_GET['year']) ? intval($_GET['year']) : null;

    $whereClause = "WHERE is_banned = 0";

    if ($period === 'week') {
        if ($week !== null) {
            $whereClause .= " AND WEEK(regDate, 1) = WEEK(MAKEDATE(YEAR(NOW()), 1) + INTERVAL ($week - 1) WEEK, 1)";
            $whereClause .= " AND YEAR(regDate) = YEAR(NOW()) AND MONTH(regDate) = MONTH(NOW())";
        } else {
            $whereClause .= " AND regDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        }
    } elseif ($period === 'month') {
        if ($month !== null) {
            $whereClause .= " AND MONTH(regDate) = $month";
            $whereClause .= $year !== null ? " AND YEAR(regDate) = $year" : " AND YEAR(regDate) = YEAR(NOW())";
        } else {
            $whereClause .= " AND regDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        }
    } elseif ($period === 'year') {
        if ($year !== null) {
            $whereClause .= " AND YEAR(regDate) = $year";
        } else {
            $whereClause .= " AND regDate >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
        }
    }

    $query = "SELECT COUNT(user_id) as total_users FROM users $whereClause";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode($result);
    } else {
        throw new Exception("Failed to fetch user count");
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

?>