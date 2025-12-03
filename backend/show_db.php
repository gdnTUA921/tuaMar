<?php
include "connect_db.php";
include "corsHeader.php"; // starts session
header('Content-Type: application/json');

try {
    $db = $pdo->query("SELECT DATABASE() as dbname, USER() as dbuser")->fetch(PDO::FETCH_ASSOC);
    // also show session if present
    $sessionAdmin = isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : null;
    echo json_encode([ 'db' => $db, 'session_admin' => $sessionAdmin ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([ 'error' => $e->getMessage() ]);
}

?>
