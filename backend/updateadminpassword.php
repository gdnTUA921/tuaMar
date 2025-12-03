<?php
// Set content type header first
header('Content-Type: application/json');

// Include files with error handling
if (!file_exists("connect_db.php")) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection file not found.']);
    exit;
}

if (!file_exists("corsHeader.php")) {
    echo json_encode(['status' => 'error', 'message' => 'CORS header file not found.']);
    exit;
}

include "connect_db.php";
include "corsHeader.php";

// Check if PDO connection exists
if (!isset($pdo)) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit;
}

// Get and validate input
$inputRaw = file_get_contents("php://input");
if (empty($inputRaw)) {
    echo json_encode(['status' => 'error', 'message' => 'No input data received.']);
    exit;
}

$input = json_decode($inputRaw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input: ' . json_last_error_msg()]);
    exit;
}

// Validate required fields
$email = trim($input['email'] ?? '');
$newPassword = trim($input['new_password'] ?? '');
$oldPassword = trim($input['old_password'] ?? '');

if (empty($email) || empty($newPassword) || empty($oldPassword)) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid email format.']);
    exit;
}

// Validate password length
if (strlen($newPassword) < 6) {
    echo json_encode(['status' => 'error', 'message' => 'New password must be at least 6 characters long.']);
    exit;
}

try {
    // Check if admin exists
    $stmt = $pdo->prepare("SELECT password FROM admin_tbl WHERE email = ?");
    $stmt->execute([$email]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(['status' => 'error', 'message' => 'Admin not found.']);
        exit;
    }

    $storedPassword = $row['password'];
    $isValid = false;

    // Verify old password
    if (password_verify($oldPassword, $storedPassword)) {
        $isValid = true;
    }
    // Fall back to raw string match for legacy passwords
    elseif ($oldPassword === $storedPassword) {
        $isValid = true;
    }

    if (!$isValid) {
        echo json_encode(['status' => 'error', 'message' => 'Old password is incorrect.']);
        exit;
    }

    // Check if Argon2ID is available, fall back to default if not
    $hashAlgorithm = PASSWORD_DEFAULT;
    if (defined('PASSWORD_ARGON2ID')) {
        $hashAlgorithm = PASSWORD_ARGON2ID;
    }

    // Hash the new password
    $newHashedPassword = password_hash($newPassword, $hashAlgorithm);
    
    if ($newHashedPassword === false) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to hash password.']);
        exit;
    }

    // Update password
    $updateStmt = $pdo->prepare("UPDATE admin_tbl SET password = ? WHERE email = ?");
    $updateResult = $updateStmt->execute([$newHashedPassword, $email]);

    if (!$updateResult) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update password.']);
        exit;
    }

    if ($updateStmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Password updated successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No changes made to the password.']);
    }

} catch (PDOException $e) {
    // Log the actual error for debugging (don't expose to client in production)
    error_log("Password update error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Database error occurred.']);
    exit;
} catch (Exception $e) {
    // Catch any other unexpected errors
    error_log("Unexpected error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred.']);
    exit;
}
?>