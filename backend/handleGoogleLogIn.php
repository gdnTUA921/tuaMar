<?php

require __DIR__ . '/vendor/autoload.php';

include "connect_db.php";
include "corsHeader.php";

use Kreait\Firebase\Factory;

// Path to your service account key (downloaded from Firebase Console → Service Accounts)
$serviceAccountPath = __DIR__ . '/tua-market-firebase-adminsdk-fbsvc-0bacb503ad.json';

$data = json_decode(file_get_contents("php://input"), true);


if (isset($data['idToken'])) {

    // Initialize Firebase
    $factory = (new Factory)->withServiceAccount($serviceAccountPath); // Path to your Firebase service account JSON file
    $auth = $factory->createAuth();

    //Verify the ID token
    try {
        $verifiedIdToken = $auth->verifyIdToken($data['idToken']);
    } catch (\Kreait\Firebase\Exception\Auth\FailedToVerifyToken $e) {
        echo json_encode(["status" => "error", "message" => "Invalid or expired ID token"]);
        exit;
    }

    // Extract user information from the token
    $uid = $verifiedIdToken->claims()->get('sub');
    $email = $verifiedIdToken->claims()->get('email');
    $displayPic = $verifiedIdToken->claims()->get('picture');

    if ($displayPic){
        $displayPic = preg_replace('/=s\d+-c$/', '=s1000-c', $displayPic); // Get higher resolution image
    }

    $pdo->beginTransaction();

    // Check if user exists
    $stmt = $pdo->prepare("SELECT user_id, first_name, last_name, is_banned FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Check if banned
        if ($user['is_banned'] == 1){
            $pdo->rollBack();
            $_SESSION = [];
            session_destroy();
            echo json_encode([
                "status" => "banned",
                "message" => "This account has been banned from the TUA Marketplace."
            ]);
            exit;
        }

        // Update user profile
        $update = $pdo->prepare("UPDATE users SET profile_pic = :displayPic, fb_uid = :fbUID WHERE user_id = :user_id");
        $success = $update->execute([
            ':displayPic' => $displayPic,
            ':fbUID' => $uid,
            ':user_id' => $user['user_id'],
        ]);

        if ($success) {
            $pdo->commit();

            // Prevent session fixation
            session_regenerate_id(true);
            
            //Setting session variables
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['full_name'] = $user['first_name'] . ' ' . $user['last_name'];
            $_SESSION['email'] = $email;
            $_SESSION['firebase_uid'] = $uid;
            $_SESSION['pfp'] = $displayPic;

            echo json_encode(["status" => "success", "message" => "Session created."]);

        } else {
            $pdo->rollBack();
            $_SESSION = [];
            session_destroy();
            echo json_encode(["status" => "error", "message" => "Failed to update user."]);
        }

    } else {
        $pdo->rollBack();
        $_SESSION = [];
        session_destroy();
        echo json_encode(["status" => "error", "message" => "User not found. Please kindly register first."]);
    }

} else {
    echo json_encode(["status" => "error", "message" => "Missing ID token"]);
}