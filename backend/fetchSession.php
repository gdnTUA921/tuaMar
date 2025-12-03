<?php
include "corsHeader.php";

if (isset($_SESSION['user_id']) && isset($_SESSION['email'])) {
    echo json_encode([
        "user_type" => 'user',
        "user_id" => $_SESSION['user_id'],
        "firebase_uid" => $_SESSION['firebase_uid'],
        "pfp" => $_SESSION['pfp'],
        "full_name" => $_SESSION['full_name'],
    ]);
} 
else if (isset($_SESSION['admin_id']) && isset($_SESSION['email'])) {
    echo json_encode([
        "user_type" => 'admin',
        "admin_id" => $_SESSION['admin_id'],
        "email" => $_SESSION['email'],
    ]);
} 
else {
    echo json_encode(["user_id" => null]);
}
?>
