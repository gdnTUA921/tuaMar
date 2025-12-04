<?php

include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

try {
    $period = isset($_GET['period']) ? $_GET['period'] : 'overall';
    $week = isset($_GET['week']) ? intval($_GET['week']) : null;
    $month = isset($_GET['month']) ? intval($_GET['month']) : null;
    $year = isset($_GET['year']) ? intval($_GET['year']) : null;

    // Build WHERE clause based on period
    $whereClause = "WHERE is_banned = 0";

    if ($period === 'week') {
        if ($week !== null && $month !== null && $year !== null) {
            // Specific week of specific month (week 1 = days 1-7, week 2 = days 8-14, etc.)
            $startDay = ($week - 1) * 7 + 1;
            $endDay = $week * 7;
            $whereClause .= " AND DAY(regDate) BETWEEN $startDay AND $endDay";
            $whereClause .= " AND MONTH(regDate) = $month";
            $whereClause .= " AND YEAR(regDate) = $year";
        } else {
            // Default to last 7 days
            $whereClause .= " AND regDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        }
    } elseif ($period === 'month') {
        if ($month !== null) {
            // Specific month
            $whereClause .= " AND MONTH(regDate) = $month";
            if ($year !== null) {
                $whereClause .= " AND YEAR(regDate) = $year";
            } else {
                $whereClause .= " AND YEAR(regDate) = YEAR(NOW())";
            }
        } else {
            // Default to last 30 days
            $whereClause .= " AND regDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        }
    } elseif ($period === 'year') {
        if ($year !== null) {
            // Specific year
            $whereClause .= " AND YEAR(regDate) = $year";
        } else {
            // Default to last 365 days
            $whereClause .= " AND regDate >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
        }
    }
    // If 'overall', no additional date filter

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
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}

?>