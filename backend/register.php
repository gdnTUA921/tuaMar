<?php
// filepath: c:\xampp\htdocs\tua_marketplace\register.php

include "connect_db.php";
include "corsHeader.php";
require_once "firebaseInit.php";   // ← ensures $storage (Firebase Admin) is initialized

header("Content-Type: application/json");

// Path to your service account key (downloaded from Firebase Console → Service Accounts)
$serviceAccountPath = __DIR__ . '/tua-market-firebase-adminsdk-fbsvc-0bacb503ad.json';

// Only allow POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

// Validate required text fields
$requiredFields = ["email", "firstName", "lastName", "department", "schoolId", "typeUser"];
foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        exit();
    }
}

$email = $_POST["email"];
$firstName = $_POST["firstName"];
$lastName = $_POST["lastName"];
$department = $_POST["department"];
$schoolId = $_POST["schoolId"];
$typeUser = $_POST["typeUser"];

// Validate TUA email
if (!preg_match('/@tua\.edu\.ph$/', $email)) {
    echo json_encode(["success" => false, "message" => "Please use your TUA email address"]);
    exit();
}

// Validate uploaded file
if (!isset($_FILES["schoolIdImage"])) {
    echo json_encode(["success" => false, "message" => "Please upload your school ID image"]);
    exit();
}

$file = $_FILES["schoolIdImage"];

if ($file["error"] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "Image upload error"]);
    exit();
}

try {
    // ---------------------------
    // CHECK DUPLICATES
    // ---------------------------

    // Check if email exists in users
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "Email already registered"]);
        exit();
    }

    // Check if email exists in pending
    $stmt = $pdo->prepare("SELECT registration_id FROM pending_registrations 
                           WHERE email = ? AND status = 'PENDING'");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "Registration already pending approval"]);
        exit();
    }

    // Check if school ID exists
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE id_number = ?");
    $stmt->execute([$schoolId]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "School ID already registered"]);
        exit();
    }

    // ---------------------------
    // UPLOAD IMAGE TO FIREBASE STORAGE (PHP ADMIN SDK)
    // ---------------------------
    $storage = getFirebaseStorage();
    $bucket = $storage->getBucket();

    $timestamp = time();
    $cleanName = preg_replace("/[^A-Za-z0-9\.\-_]/", "_", basename($file["name"]));
    $firebasePath = "school_ids/{$timestamp}_" . $cleanName;

    // Upload to Firebase
    $bucket->upload(
        fopen($file["tmp_name"], 'r'),
        ['name' => $firebasePath]
    );

    // Generate signed URL (1 year)
    $expiresAt = new DateTime("+1 year");
    $imageUrl = $bucket->object($firebasePath)->signedUrl($expiresAt);

    // ---------------------------
    // INSERT INTO pending_registrations
    // ---------------------------

    $stmt = $pdo->prepare("
        INSERT INTO pending_registrations 
        (email, first_name, last_name, department, school_id, school_id_image, user_type, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())
    ");

    $stmt->execute([
        $email,
        $firstName,
        $lastName,
        $department,
        $schoolId,
        $imageUrl,
        $typeUser
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Registration submitted successfully. Awaiting admin approval."
    ]);
    exit();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
    exit();
}
