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
    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['user_id']) || !isset($input['user_email']) || !isset($input['action']) || !isset($input['user_type'])) {
        throw new Exception("Missing required fields: user_id, user_email, action, user_type");
    }

    $user_id = $input['user_id'];
    $user_email = $input['user_email'];
    $action = $input['action']; // LOGIN or LOGOUT
    $user_type = $input['user_type']; // admin or user
    $ip_address = $input['ip_address'] ?? $_SERVER['REMOTE_ADDR'];
    $browser = $input['browser'] ?? $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    $logout_datetime = $input['logout_datetime'] ?? null;
    $session_duration = $input['session_duration'] ?? null;

    // Validate user_type
    if (!in_array($user_type, ['admin', 'user'])) {
        throw new Exception("Invalid user_type. Must be 'admin' or 'user'");
    }

    // Validate action
    if (!in_array($action, ['LOGIN', 'LOGOUT'])) {
        throw new Exception("Invalid action. Must be 'LOGIN' or 'LOGOUT'");
    }

    // If action is LOGIN
    if ($action === 'LOGIN') {
        $current_time = date('Y-m-d H:i:s');

        $query = "INSERT INTO audit_logs (user_id, user_email, user_type, action, ip_address, browser, login_datetime) 
                  VALUES (:user_id, :user_email, :user_type, :action, :ip_address, :browser, :login_datetime)";

        $stmt = $pdo->prepare($query);
        $stmt->execute([
            ':user_id' => $user_id,
            ':user_email' => $user_email,
            ':user_type' => $user_type,
            ':action' => $action,
            ':ip_address' => $ip_address,
            ':browser' => $browser,
            ':login_datetime' => $current_time
        ]);
    }
    // If action is LOGOUT
    elseif ($action === 'LOGOUT') {
        $current_time = date('Y-m-d H:i:s');

        // Find the most recent LOGIN record for this user to calculate duration
        $findLoginQuery = "SELECT login_datetime FROM audit_logs 
                          WHERE user_id = :user_id AND user_type = :user_type AND action = 'LOGIN' 
                          AND logout_datetime IS NULL
                          ORDER BY login_datetime DESC LIMIT 1";

        $findStmt = $pdo->prepare($findLoginQuery);
        $findStmt->execute([
            ':user_id' => $user_id,
            ':user_type' => $user_type
        ]);

        $loginRecord = $findStmt->fetch(PDO::FETCH_ASSOC);

        // Calculate session duration if login record exists
        $calculated_duration = null;
        if ($loginRecord && $loginRecord['login_datetime']) {
            $login_time = strtotime($loginRecord['login_datetime']);
            $logout_time = strtotime($current_time);
            $calculated_duration = $logout_time - $login_time;
        }

        // Use provided session_duration if available, otherwise use calculated
        $final_duration = $session_duration ?? $calculated_duration;

        // Update the most recent LOGIN record with logout info
        $updateQuery = "UPDATE audit_logs 
                       SET logout_datetime = :logout_datetime, session_duration = :session_duration
                       WHERE user_id = :user_id AND user_type = :user_type AND action = 'LOGIN' AND logout_datetime IS NULL
                       ORDER BY login_datetime DESC LIMIT 1";

        $stmt = $pdo->prepare($updateQuery);
        $stmt->execute([
            ':logout_datetime' => $current_time,
            ':session_duration' => $final_duration,
            ':user_id' => $user_id,
            ':user_type' => $user_type
        ]);

        // Insert LOGOUT record
        $query = "INSERT INTO audit_logs (user_id, user_email, user_type, action, ip_address, browser, login_datetime, logout_datetime, session_duration) 
                  VALUES (:user_id, :user_email, :user_type, :action, :ip_address, :browser, :login_datetime, :logout_datetime, :session_duration)";

        $stmt = $pdo->prepare($query);
        $stmt->execute([
            ':user_id' => $user_id,
            ':user_email' => $user_email,
            ':user_type' => $user_type,
            ':action' => $action,
            ':ip_address' => $ip_address,
            ':browser' => $browser,
            ':login_datetime' => $current_time,
            ':logout_datetime' => $current_time,
            ':session_duration' => $final_duration
        ]);
    }

    echo json_encode(['status' => 'success', 'message' => "$action recorded successfully for $user_type"]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

?>