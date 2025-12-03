<?php
// logout.php

include "corsHeader.php"; //session is already started in corsHeader.php

// Unset all session variables
$_SESSION = [];

// Destroy the session
session_destroy();


// Remove the session cookie from the browser
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', [
    'expires'  => time() - 42000,
    'path'     => $params['path'],
    'domain'   => $params['domain'],
    'secure'   => $params['secure'],
    'httponly' => $params['httponly'],
    'samesite' => $params['samesite'] ?? 'None', // if you’re using SameSite=None
    ]);
}

// Optionally, send a response back
header('Content-Type: application/json');
echo json_encode(['message' => 'Logged out successfully']);

?>
