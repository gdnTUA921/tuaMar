<?php
include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("
        SELECT category, COUNT(*) AS count
        FROM posted_items p JOIN users u ON u.user_id = p.user_id
        WHERE u.is_banned = 0 AND p.status = 'AVAILABLE'
        GROUP BY category
    ");

    $results = $stmt->fetchAll();
    echo json_encode($results);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
