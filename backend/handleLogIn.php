<?php
include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

// Rate limiting (session-based)
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
    $_SESSION['last_attempt'] = time();
}

// If too many attempts within 15 minutes, block
if ($_SESSION['login_attempts'] >= 5 && (time() - $_SESSION['last_attempt']) < 900) {
    echo json_encode([
        "status" => "fail",
        "message" => "Too many failed attempts. Please try again later."
    ]);
    exit;
}

if (!empty($input['user']) && !empty($input['password'])) {
    try {
        $email = trim($input['user']);
        $password = trim($input['password']);

        // Fetch stored password by email
        $stmt = $pdo->prepare("SELECT admin_id, password FROM admin_tbl WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $storedPassword = $row['password'];
            $isValid = false;

            // Check if it's hashed and verify
            if (password_verify($password, $storedPassword)) {
                $isValid = true;
            }
            // Fallback: direct string match for legacy plaintext passwords
            else if ($password === $storedPassword) {
                $isValid = true;
            }

            if ($isValid) {
                // Prevent session fixation
                session_regenerate_id(true);
                
                $_SESSION['login_attempts'] = 0; // Reset on successful login

                $_SESSION['email'] = $email;
                $_SESSION['admin_id'] = $row['admin_id'];

                echo json_encode([
                    "status" => "success"
                ]);
            } else {
                // Failed login: increment counter + slow down brute force
                $_SESSION['login_attempts']++;
                $_SESSION['last_attempt'] = time();
                sleep(2);

                echo json_encode([
                    "status" => "fail",
                    "message" => "Invalid credentials"
                ]);
            }
        } else {
            // Failed login: increment counter + slow down brute force
            $_SESSION['login_attempts']++;
            $_SESSION['last_attempt'] = time();
            sleep(2);

            echo json_encode([
                "status" => "fail",
                "message" => "Invalid credentials"
            ]);
        }

    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Error: " . $e->getMessage()
        ]);
    }
} else {

    // Failed login: increment counter + slow down brute force
    $_SESSION['login_attempts']++;
    $_SESSION['last_attempt'] = time();
    sleep(2);

    echo json_encode([
        "status" => "fail",
        "message" => "Missing input"
    ]);
}
exit;
?>