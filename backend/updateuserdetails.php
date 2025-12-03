<?php
try {
    include "corsHeader.php";
    include "connect_db.php";

    // Validate user_id
    if (!isset($_GET['user_id']) || !is_numeric($_GET['user_id'])) {
        throw new Exception("Missing or invalid user_id.");
    }

    $user_id = intval($_GET['user_id']);

    $query = "
        SELECT 
            user_id AS id,
            id_number,
            first_name,
            last_name,
            email,
            department,
            user_type AS type,
            profile_pic
        FROM users
        WHERE user_id = :user_id
        LIMIT 1
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute(['user_id' => $user_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode($result);
    } else {
        throw new Exception("User not found.");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["error" => $e->getMessage()]);
}
