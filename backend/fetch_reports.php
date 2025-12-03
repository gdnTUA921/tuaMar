<?php

include "connect_db.php";
include "corsHeader.php";

try {
    $query = "SELECT r.report_id, r.report_type, r.item_id, r.reported_id, r.report_reason, r.report_desc, r.reported_at, r.status, u.department, r.images,
             (SELECT CONCAT(ru.first_name, ' ', ru.last_name) FROM users ru WHERE ru.user_id = r.user_id) as reporter,
             CONCAT(u.first_name, ' ', u.last_name) as reported_user, 
             p.item_name 
             FROM all_reports r 
             LEFT JOIN users u ON r.reported_id = u.user_id 
             LEFT JOIN posted_items p ON r.item_id = p.item_id 
             ORDER BY r.reported_at DESC";

    $stmt = $pdo->query($query);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
?>