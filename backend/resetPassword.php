<?php

include "corsHeader.php";
include "connect_db.php";

// Set JSON content type header
header('Content-Type: application/json');

$response = []; // initialize to ensure a JSON response is always available

try {
    // Check if PDO connection exists
    if (!isset($pdo) || !$pdo) {
        throw new Exception("Database connection failed");
    }

    $input = json_decode(file_get_contents("php://input"), true);

    $email = $input['email'] ?? null;
    $newPass = $input['newPass'] ?? null;
    $confirmPass = $input['confirmPass'] ?? null;

    if (!empty($email) && !empty($newPass) && !empty($confirmPass)) {

        if ($newPass === $confirmPass) {
            // Check if Argon2ID is available, fall back to default if not
            $hashAlgorithm = PASSWORD_DEFAULT;
            if (defined('PASSWORD_ARGON2ID')) {
                $hashAlgorithm = PASSWORD_ARGON2ID;
            }
            
            $newHashedPass = password_hash($newPass, $hashAlgorithm);

            $query = "UPDATE admin_tbl SET password = :password WHERE email = :email";

            $stmt = $pdo->prepare($query);
            $result = $stmt->execute([
                ":password" => $newHashedPass,
                ":email" => $email,
            ]);

            if ($result) {
                // Check if any rows were actually updated
                if ($stmt->rowCount() > 0) {
                    $response = ["message" => "Password Reset Successful"];
                } else {
                    $response = ["error" => "No user found with that email address"];
                }
            } else {
                throw new PDOException("Password Reset Failed");
            }
        } else {
            $response = ["error" => "Passwords do not match"];
        }

    } else {
        $response = ["error" => "Missing Required Fields"];
    }

} catch (PDOException $e) {
    $response = ["error" => "Database error: " . $e->getMessage()];
} catch (Exception $e) {
    $response = ["error" => $e->getMessage()];
} catch (Error $e) {
    $response = ["error" => "Fatal error: " . $e->getMessage()];
}

// Ensure we always output valid JSON
echo json_encode($response);

?>