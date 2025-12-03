<?php

include "corsHeader.php";
include "connect_db.php";

header('Content-Type: application/json'); // Always set JSON header

try {
    $types = ["Faculty", "Student", "Staff"];
    $userCounts = [];

    foreach ($types as $type) {
        $query = "SELECT COUNT(user_type) as count_{$type} FROM users WHERE user_type = :type AND is_banned = 1";
        $stmt = $pdo->prepare($query);
        $stmt->execute([':type' => $type]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $userCounts[$type] = $result["count_{$type}"];
        } else {
            throw new Exception("Failed to fetch user count for type: {$type}");
        }
    }

    echo json_encode($userCounts);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

?>
