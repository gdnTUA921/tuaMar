<?php
include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

// This assumes you're using a session or otherwise storing the current admin
$admin_id = $_SESSION['admin_id'] ?? null;

if (!$admin_id) {
    echo json_encode(['status' => 'error', 'message' => 'Not authenticated.']);
    exit;
}

$stmt = $conn->prepare("SELECT email FROM admin_tbl WHERE id = ?");
$stmt->bind_param("i", $admin_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(['status' => 'success', 'email' => $row['email']]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Admin not found.']);
}
?>
