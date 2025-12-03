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
    $whereClause = "WHERE u.is_banned = 0 AND p.status = 'AVAILABLE'";

    if ($period === 'week') {
        if ($week !== null) {
            // Specific week of current month
            $whereClause .= " AND WEEK(p.listing_date, 1) = WEEK(MAKEDATE(YEAR(NOW()), 1) + INTERVAL ($week - 1) WEEK, 1)";
            $whereClause .= " AND YEAR(p.listing_date) = YEAR(NOW())";
            $whereClause .= " AND MONTH(p.listing_date) = MONTH(NOW())";
        } else {
            // Default to last 7 days
            $whereClause .= " AND p.listing_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        }
    } elseif ($period === 'month') {
        if ($month !== null) {
            // Specific month
            $whereClause .= " AND MONTH(p.listing_date) = $month";
            if ($year !== null) {
                $whereClause .= " AND YEAR(p.listing_date) = $year";
            } else {
                $whereClause .= " AND YEAR(p.listing_date) = YEAR(NOW())";
            }
        } else {
            // Default to last 30 days
            $whereClause .= " AND p.listing_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        }
    } elseif ($period === 'year') {
        if ($year !== null) {
            // Specific year
            $whereClause .= " AND YEAR(p.listing_date) = $year";
        } else {
            // Default to last 365 days
            $whereClause .= " AND p.listing_date >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
        }
    }
    // If 'overall', no additional date filter

    $stmt = $pdo->query("
        SELECT p.category, COUNT(*) AS count
        FROM posted_items p 
        JOIN users u ON u.user_id = p.user_id
        $whereClause
        GROUP BY p.category
        ORDER BY count DESC
    ");

    $results = $stmt->fetchAll();
    echo json_encode($results);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

?>