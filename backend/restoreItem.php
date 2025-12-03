<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';
require 'phpmailer/src/Exception.php';

require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

include "connect_db.php";
include "corsHeader.php";

header("Content-Type: application/json");

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['item_id'])) {
        echo json_encode(["success" => false, "message" => "Missing item_id"]);
        exit;
    }

    $item_id = $data['item_id'];

    // Fetch item + user email
    $stmt = $pdo->prepare("
        SELECT a.*, u.email 
        FROM archivedeleted_items a 
        JOIN users u ON a.user_id = u.user_id 
        WHERE a.item_id = ?
    ");
    $stmt->execute([$item_id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        echo json_encode(["success" => false, "message" => "Item not found in archive"]);
        exit;
    }

    // Insert into posted_items (without reason)
    $insertStmt = $pdo->prepare("
        INSERT INTO posted_items (item_id, item_name, price, category, item_condition, description, user_id, listing_date, preview_pic, status)
        VALUES (:item_id, :item_name, :price, :category, :item_condition, :description, :user_id, :listing_date, :preview_pic, :status)
    ");
    $insertStmt->execute([
        ':item_id' => $item['item_id'],
        ':item_name' => $item['item_name'],
        ':price' => $item['price'],
        ':category' => $item['category'],
        ':item_condition' => $item['item_condition'],
        ':description' => $item['description'],
        ':user_id' => $item['user_id'],
        ':listing_date' => $item['listing_date'],
        ':preview_pic' => $item['preview_pic'],
        ':status' => "AVAILABLE",
    ]);

    // Delete from archive
    $deleteStmt = $pdo->prepare("DELETE FROM archivedeleted_items WHERE item_id = ?");
    $deleteStmt->execute([$item_id]);

    // Send email notification
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = $_ENV['MAIL_USER'];
        $mail->Password = $_ENV['MAIL_PASS'];
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_NAME']);
        $mail->addAddress($item['email']);
        $mail->Subject = 'Your listing has been restored';
        $mail->isHTML(true);

        $mail->Body = <<<HTML
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Listing Restored</title>
        </head>
        <body style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; padding: 20px; color: #2d2d2d;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 25px;">
                <div style="border-bottom: 3px solid #547B3E; padding-bottom: 10px; margin-bottom: 25px;">
                    <h2 style="color: #547B3E; margin: 0;">TUA Marketplace Update</h2>
                </div>

                <h3 style="color: #444;">Hello,</h3>
                <p style="line-height: 1.6;">We're pleased to inform you that your listing titled <strong style="color: #333;">{$item['item_name']}</strong> has been <strong style="color: green;">restored</strong> and is now visible again on the TUA Marketplace.</p>

                <div style="text-align: center; margin: 20px 0;">
                    <img src="{$item['preview_pic']}" alt="Item Image" style="max-width: 300px; border-radius: 10px; border: 2px solid #ccc;" />
                </div>

                <p style="line-height: 1.6;">If you have any questions or need assistance, feel free to contact the admin team using the details below.</p>

                <hr style="margin: 30px 0;" />
                <h4 style="color: #547B3E;">Contact Us:</h4>
                <div style="background-color: #f0f7f0; padding: 15px; border-radius: 6px;">
                    <p><strong>Phone:</strong> 0927 914 2603</p>
                    <p><strong>Email:</strong> <a href="mailto:tuamarketplace.support@gmail.com" style="color: #547B3E;">tuamarketplace.support@gmail.com</a></p>
                    <p><strong>Office:</strong> TUA - CEIS, SSC Building (4th Floor)</p>
                </div>

                <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
                    This is an automated message. Please do not reply directly to this email.
                </p>
            </div>
        </body>
        </html>
        HTML;

        $mail->AltBody = "TUA Marketplace Update\n\n"
            . "Hello,\n\n"
            . "We're pleased to inform you that your listing titled \"{$item['item_name']}\" has been restored and is now visible again on the TUA Marketplace.\n\n"
            . "If you have any questions or need assistance, feel free to contact the admin team:\n"
            . "Phone: 0927 914 2603\n"
            . "Email: tuamarketplace.support@gmail.com\n"
            . "Office: TUA - CEIS, SSC Building (4th Floor)\n\n"
            . "This is an automated message. Please do not reply directly to this email.";
            
        $mail->send();

    } catch (Exception $e) {
        error_log("Email failed to send: {$e->getMessage()}");
        // Optional: silently ignore or return warning message
    }

    // log restore
    try {
        $activity = "Restored archived item {$item_id}";
        $logStmt = $pdo->prepare("INSERT INTO admin_logs (`datetime`, `admin_id`, `activity`, `ip_address`) VALUES (NOW(), :admin_id, :activity, :ip_address)");
        $logStmt->execute([
            ':admin_id' => $_SESSION['admin_id'] ?? null,
            ':activity' => $activity,
            ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? ''
        ]);
    } catch (Exception $e) { /* ignore */ }

    echo json_encode(["success" => true, "message" => "Item restored and user notified."]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
