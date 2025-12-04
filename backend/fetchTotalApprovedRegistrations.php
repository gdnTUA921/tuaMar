<?php
include "connect_db.php";
include "corsHeader.php";

try {

    // Get period parameter (overall, week, month, year)
    $period = isset($_GET['period']) ? $_GET['period'] : 'overall';
    $week = isset($_GET['week']) ? intval($_GET['week']) : null;
    $month = isset($_GET['month']) ? intval($_GET['month']) : null;
    $year = isset($_GET['year']) ? intval($_GET['year']) : null;

    // Build query based on period
    $sql = "SELECT COUNT(registration_id) as total_approved_registrations 
            FROM pending_registrations 
            WHERE status = 'APPROVED'";

    // Add date filter based on period
    if ($period === 'week') {
        if ($week !== null && $month !== null && $year !== null) {
            // Specific week of specific month (week 1 = days 1-7, week 2 = days 8-14, etc.)
            $startDay = ($week - 1) * 7 + 1;
            $endDay = $week * 7;
            $sql .= " AND DAY(created_at) BETWEEN $startDay AND $endDay";
            $sql .= " AND MONTH(created_at) = $month";
            $sql .= " AND YEAR(created_at) = $year";
        } else {
            $sql .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        }
    } elseif ($period === 'month') {
        if ($month !== null) {
            $sql .= " AND MONTH(created_at) = $month";
            $sql .= $year !== null ? " AND YEAR(created_at) = $year" : " AND YEAR(created_at) = YEAR(NOW())";
        } else {
            $sql .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        }
    } elseif ($period === 'year') {
        if ($year !== null) {
            $sql .= " AND YEAR(created_at) = $year";
        } else {
            $sql .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
        }
    }
    // 'overall' period has no date filter

    $stmt = $pdo->query($sql);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'total_approved_registrations' => (int) $result['total_approved_registrations']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>