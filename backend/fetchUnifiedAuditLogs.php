<?php

include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

// Set timezone to Asia/Manila (Philippine Time)
date_default_timezone_set('Asia/Manila');

// Set MySQL timezone to match PHP timezone
try {
    $pdo->exec("SET time_zone = '+08:00'");
} catch (Exception $e) {
    // Ignore timezone setting errors
}

try {
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    $user_type = isset($_GET['user_type']) ? $_GET['user_type'] : null; // Filter by 'admin' or 'user' or null for all

    // Build WHERE clause
    $whereClause = "1=1";
    if ($user_type && in_array($user_type, ['admin', 'user'])) {
        $whereClause .= " AND user_type = :user_type";
    }

    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM audit_logs WHERE $whereClause";
    $stmt = $pdo->prepare($countQuery);
    if ($user_type && in_array($user_type, ['admin', 'user'])) {
        $stmt->execute([':user_type' => $user_type]);
    } else {
        $stmt->execute();
    }
    $countResult = $stmt->fetch(PDO::FETCH_ASSOC);
    $total = $countResult['total'];

    // Fetch paginated logs
    $query = "SELECT audit_id, user_id, user_email, user_type, action, ip_address, browser, 
                     login_datetime, logout_datetime, session_duration
              FROM audit_logs 
              WHERE $whereClause
              ORDER BY login_datetime DESC
              LIMIT :limit OFFSET :offset";

    $stmt = $pdo->prepare($query);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    if ($user_type && in_array($user_type, ['admin', 'user'])) {
        $stmt->bindValue(':user_type', $user_type, PDO::PARAM_STR);
    }

    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'logs' => $logs,
        'total' => $total,
        'limit' => $limit,
        'offset' => $offset
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

?>