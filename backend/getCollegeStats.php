<?php
include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("
        SELECT department AS college, COUNT(*) AS students
        FROM users
        WHERE is_banned = 0
        GROUP BY department
    ");

    $results = $stmt->fetchAll();
    echo json_encode($results);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
