<?php
include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

try {

    // Get pagination parameters
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

    // Get filter parameter (rating value)
    $ratingFilter = isset($_GET['rating']) ? intval($_GET['rating']) : null;

    // Build base query
    $sql = "SELECT 
                ur.rating_id,
                ur.user_id,
                ur.rating,
                ur.feedback,
                ur.created_at,
                u.first_name,
                u.last_name,
                u.email,
                u.department
            FROM user_ratings ur
            JOIN users u ON ur.user_id = u.user_id";

    // Add filter if rating specified
    if ($ratingFilter !== null && $ratingFilter >= 1 && $ratingFilter <= 5) {
        $sql .= " WHERE ur.rating = :rating";
    }

    // Add ordering and pagination
    $sql .= " ORDER BY ur.created_at DESC LIMIT :limit OFFSET :offset";

    $stmt = $pdo->prepare($sql);

    if ($ratingFilter !== null && $ratingFilter >= 1 && $ratingFilter <= 5) {
        $stmt->bindValue(':rating', $ratingFilter, PDO::PARAM_INT);
    }

    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();
    $ratings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->closeCursor();

    // Get total count for pagination
    $countSql = "SELECT COUNT(*) as total FROM user_ratings ur";
    if ($ratingFilter !== null && $ratingFilter >= 1 && $ratingFilter <= 5) {
        $countSql .= " WHERE ur.rating = :rating";
    }

    $countStmt = $pdo->prepare($countSql);
    if ($ratingFilter !== null && $ratingFilter >= 1 && $ratingFilter <= 5) {
        $countStmt->bindValue(':rating', $ratingFilter, PDO::PARAM_INT);
    }
    $countStmt->execute();
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        'ratings' => $ratings,
        'total' => (int) $totalCount
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>