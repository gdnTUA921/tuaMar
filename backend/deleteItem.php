<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/phpmailer/src/PHPMailer.php';
require __DIR__ . '/phpmailer/src/SMTP.php';
require __DIR__ . '/phpmailer/src/Exception.php';

require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

include "connect_db.php";
include "corsHeader.php";

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->item_id)) {
        $item_id = $data->item_id;
        $reason = $data->reason ?? "Deleted by admin";

        try {
            // Fetch original item and user email
            $stmt = $pdo->prepare("
                SELECT p.*, u.email 
                FROM posted_items p 
                JOIN users u ON p.user_id = u.user_id 
                WHERE p.item_id = :item_id
            ");
            $stmt->execute([':item_id' => $item_id]);
            $item = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$item) {
                echo json_encode(["success" => false, "message" => "Item or user not found."]);
                exit;
            }

            // Insert into archive
            $insertStmt = $pdo->prepare("
                INSERT INTO archivedeleted_items 
                (item_id, item_name, price, category, item_condition, description, user_id, listing_date, preview_pic, status, reason)
                VALUES 
                (:item_id, :item_name, :price, :category, :item_condition, :description, :user_id, :listing_date, :preview_pic, :status, :reason)
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
                ':status' => $item['status'],
                ':reason' => $reason,
            ]);

            // Delete from original table
            $deleteStmt = $pdo->prepare("DELETE FROM posted_items WHERE item_id = :item_id");
            $deleteStmt->execute([':item_id' => $item_id]);

            // Check for violation count
            $countStmt = $pdo->prepare("SELECT COUNT(*) AS violation_count FROM archivedeleted_items WHERE user_id = :user_id");
            $countStmt->execute([':user_id' => $item['user_id']]);
            $violationRow = $countStmt->fetch(PDO::FETCH_ASSOC);
            $violationCount = $violationRow['violation_count'];

            
            if ($violationCount == 4) {
                $updateStmt = $pdo->prepare("UPDATE users SET is_banned = 1 WHERE user_id = :user_id");
                $updateStmt->execute([':user_id' => $item['user_id']]);
            }

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
                $mail->Subject = 'Your listing has been removed';
                $mail->isHTML(true);
                $mail->Body = <<<HTML
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>TUA Marketplace Notification</title>
                    </head>
                    <body style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4; padding: 20px; color: #2d2d2d;">
                        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 25px;">
                            <div style="border-bottom: 3px solid #547B3E; padding-bottom: 10px; margin-bottom: 25px;">
                                <h2 style="color: #547B3E; margin: 0;">TUA Marketplace Notice</h2>
                            </div>

                            <h3 style="color: #444;">Hello,</h3>
                            <p style="line-height: 1.6;">We would like to inform you that your listing titled <strong style="color: #333;">{$item['item_name']}</strong> has been <strong style="color: red;">removed</strong> from the TUA Marketplace by the administrator.</p>

                            <div style="text-align: center; margin: 20px 0;">
                                <img src="{$item['preview_pic']}" alt="Item Image" style="max-width: 300px; border-radius: 10px; border: 2px solid #ccc;" />
                            </div>

                            <p style="margin: 10px 0;"><strong>Reason for Removal:</strong><br> <strong style="color: red;">{$reason}</strong></p>

                            <p style="line-height: 1.6;">This action was taken in accordance with our marketplace policies and guidelines. Please take a moment to review your listing details and ensure compliance with our standards.</p>

                            <p style="line-height: 1.6;">If you believe this removal was made in error or would like clarification, contact us at <a href="mailto:bangusdevs@gmail.com" style="color: #547B3E;">bangusdevs@gmail.com</a>.</p>

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

                $mail->AltBody = "TUA Marketplace Notice\n\n"
                    . "Hello,\n\n"
                    . "We would like to inform you that your listing titled \"{$item['item_name']}\" has been REMOVED from the TUA Marketplace by the administrator.\n\n"
                    . "Reason for Removal:\n{$reason}\n\n"
                    . "This action was taken in accordance with our marketplace policies and guidelines. Please review your listing details and ensure compliance with our standards.\n\n"
                    . "If you believe this removal was made in error or would like clarification, contact us at: bangusdevs@gmail.com\n\n"
                    . "Contact Us:\n"
                    . "Phone: 0927 914 2603\n"
                    . "Email: tuamarketplace.support@gmail.com\n"
                    . "Office: TUA - CEIS, SSC Building (4th Floor)\n\n"
                    . "This is an automated message. Please do not reply directly to this email.";

                $mail->send();
            } catch (Exception $e) {
                error_log("Email sending failed: " . $mail->ErrorInfo);
            }

            // server-side audit log (best-effort)
            try {
                $activity = "Archived and deleted item {$item['item_id']} (reason: {$reason})";
                $logStmt = $pdo->prepare("INSERT INTO admin_logs (`datetime`, `admin_id`, `activity`, `ip_address`) VALUES (NOW(), :admin_id, :activity, :ip_address)");
                $logStmt->execute([
                    ':admin_id' => $_SESSION['admin_id'] ?? null,
                    ':activity' => $activity,
                    ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? ''
                ]);
            } catch (Exception $e) {
                // ignore logging errors — should not block the main flow
            }

            echo json_encode(["success" => true, "message" => "Item archived, deleted, and user notified."]);
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Missing item_id."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
