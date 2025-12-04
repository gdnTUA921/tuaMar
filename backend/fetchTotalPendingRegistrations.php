<?php

include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

try {
    $period = isset($_GET['period']) ? $_GET['period'] : 'overall';
    $week = isset($_GET['week']) ? intval($_GET['week']) : null;
    $month = isset($_GET['month']) ? intval($_GET['month']) : null;
    $year = isset($_GET['year']) ? intval($_GET['year']) : null;

    $whereClause = "WHERE status = 'PENDING'";

    if ($period === 'week') {
        if ($week !== null && $month !== null && $year !== null) {
            // Specific week of specific month (week 1 = days 1-7, week 2 = days 8-14, etc.)
            $startDay = ($week - 1) * 7 + 1;
            $endDay = $week * 7;
            $whereClause .= " AND DAY(created_at) BETWEEN $startDay AND $endDay";
            $whereClause .= " AND MONTH(created_at) = $month";
            $whereClause .= " AND YEAR(created_at) = $year";
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

    $query = "SELECT COUNT(registration_id) as total_pending_registrations FROM pending_registrations $whereClause";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode($result);
    } else {
        throw new Exception("Failed to fetch pending registrations count");
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

?>