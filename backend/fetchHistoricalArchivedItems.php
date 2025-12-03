<?php

include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

try {
    $period = isset($_GET['period']) ? $_GET['period'] : 'overall';
    $week = isset($_GET['week']) ? intval($_GET['week']) : null;
    $month = isset($_GET['month']) ? intval($_GET['month']) : null;
    $year = isset($_GET['year']) ? intval($_GET['year']) : null;

    $whereClause = "";

    if ($period === 'week') {
        if ($week !== null) {
            $whereClause = "WHERE WEEK(listing_date, 1) = WEEK(MAKEDATE(YEAR(NOW()), 1) + INTERVAL ($week - 1) WEEK, 1) AND YEAR(listing_date) = YEAR(NOW()) AND MONTH(listing_date) = MONTH(NOW())";
        } else {
            $whereClause = "WHERE listing_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        }
    } elseif ($period === 'month') {
        if ($month !== null) {
            $yearClause = $year !== null ? "AND YEAR(listing_date) = $year" : "AND YEAR(listing_date) = YEAR(NOW())";
            $whereClause = "WHERE MONTH(listing_date) = $month $yearClause";
        } else {
            $whereClause = "WHERE listing_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        }
    } elseif ($period === 'year') {
        if ($year !== null) {
            $whereClause = "WHERE YEAR(listing_date) = $year";
        } else {
            $whereClause = "WHERE listing_date >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
        }
    } else {
        // For overall, just count all archived items
        $query = "SELECT COUNT(item_id) as total_archived_items FROM archivedeleted_items";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($result);
        exit;
    }

    $query = "SELECT COUNT(item_id) as total_archived_items FROM archivedeleted_items $whereClause";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode($result);
    } else {
        throw new Exception("Failed to fetch archived items count");
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

?>