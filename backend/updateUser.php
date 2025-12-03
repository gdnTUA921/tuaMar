<?php
include "connect_db.php";
include "corsHeader.php";
header('Content-Type: application/json');

require __DIR__.'/vendor/autoload.php'; // Firebase Admin SDK autoload

use Kreait\Firebase\Factory;

// Path to your service account key (downloaded from Firebase Console → Service Accounts)
$serviceAccountPath = __DIR__ . '/tua-market-firebase-adminsdk-fbsvc-0bacb503ad.json';


// Decode JSON input
$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? 0;


if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'Missing user_id']);
    exit;
}

try {
    $fields = [];
    $params = ['user_id' => $user_id];

    // Only add to query if the value is set and not blank
    if (!empty($data['first_name'])) {
        $fields[] = "first_name = :first_name";
        $params['first_name'] = $data['first_name'];
    }
	
    if (!empty($data['last_name'])) {
        $fields[] = "last_name = :last_name";
        $params['last_name'] = $data['last_name'];
    }
	
	if (!empty($data['id_number'])) {
    $fields[] = "id_number = :id_number";
    $params['id_number'] = $data['id_number'];
	}

    if (!empty($data['department'])) {
        $fields[] = "department = :department";
        $params['department'] = $data['department'];
    }

    if (!empty($data['email'])) {

        $email = trim($data["email"]); // Trim email
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["success" => false, "message" => "Invalid email format."]);
            exit;
        }

        // Check if email ends with @tua.edu.ph (case-insensitive)
        if (!preg_match('/@tua\.edu\.ph$/i', $email)) {
            echo json_encode(["success" => false, "message" => "Email must end with @tua.edu.ph."]);
            exit;
        }

        $fields[] = "email = :email";
        $params['email'] = $email;
    }
	
    if (!empty($data['user_type'])) {
        $fields[] = "user_type = :user_type";
        $params['user_type'] = $data['user_type'];
    }

    if (empty($fields)) {
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit;
    }	

    //Checking first if ID number inputted is already in use by another user
	$check = $pdo->prepare("SELECT user_id FROM users WHERE id_number = :id_number AND user_id != :user_id");
	$check->execute(['id_number' => $data['id_number'], 'user_id' => $data['user_id']]);
	if ($check->rowCount() > 0) {
		echo json_encode(["success" => false, "message" => "ID number already in use."]);
		exit;
	}

    //Next, checking if email inputted is already in use by another user
	$check2 = $pdo->prepare("SELECT user_id FROM users WHERE email = :email AND user_id != :user_id");
	$check2->execute(['email' => $email, 'user_id' => $data['user_id']]);
	if ($check2->rowCount() > 0) {
		echo json_encode(["success" => false, "message" => "Email already in use."]);
		exit;
	}

    // Update MySQL user details
    $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() > 0){

        //Update Firebase user details (fullname only)
        $factory = (new Factory)
            ->withServiceAccount($serviceAccountPath)
            ->withDatabaseUri('https://tua-market-default-rtdb.asia-southeast1.firebasedatabase.app');
        
        $database = $factory->createDatabase();

        //Get all chats
        $chatsList = $database->getReference('chatsList')->getValue();

        $updates = [];
        $originalFullName = $data['original_full_name'] ?? '';
        $updatedFullName = $data['first_name'] . ' ' . $data['last_name'];

        if ($chatsList) {
            foreach ($chatsList as $chatKey => $chatData) {
                if ($chatData['buyer_name'] === $originalFullName){
                    $updates["$chatKey/buyer_name"] = $updatedFullName;
                }
                if ($chatData['seller_name'] === $originalFullName){
                    $updates["$chatKey/seller_name"] = $updatedFullName;
                }
            }
        }

        if (!empty($updates)) {
            $database->getReference('chatsList')->update($updates);
        }

        // server-side audit log (best-effort)
        try {
            if (isset($_SESSION['admin_id'])) {
                $activity = "Updated user {$user_id}: " . implode(', ', array_keys($params));
                $logStmt = $pdo->prepare("INSERT INTO admin_logs (`datetime`, `admin_id`, `activity`, `ip_address`) VALUES (NOW(), :admin_id, :activity, :ip_address)");
                $logStmt->execute([
                    ':admin_id' => $_SESSION['admin_id'],
                    ':activity' => $activity,
                    ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? ''
                ]);
            }
        } catch (Exception $e) {
            // don't break main flow
        }

        echo json_encode(['success' => true]);
    }
    
    else {
        echo json_encode(['success' => false, 'message' => 'No changes made or user not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
