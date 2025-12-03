<?php
include "connect_db.php";
include "corsHeader.php";

// PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';
require 'phpmailer/src/Exception.php';

// Load .env
require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// ---------------------------------
// AUTH CHECK
// ---------------------------------
if (!isset($_SESSION['admin_id']) || !isset($_SESSION['email'])) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

// ---------------------------------
// INPUT
// ---------------------------------
$data = json_decode(file_get_contents("php://input"), true);
$registrationId = $data['registration_id'] ?? null;
$reason = $data['reason'] ?? '';

if (!$registrationId) {
    echo json_encode(["success" => false, "message" => "Missing registration ID"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // ----------------------------------------
    // FETCH REGISTRATION IF STILL PENDING
    // ----------------------------------------
    $stmt = $pdo->prepare("
        SELECT * FROM pending_registrations
        WHERE registration_id = ? AND status = 'PENDING'
    ");
    $stmt->execute([$registrationId]);
    $registration = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$registration) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Registration not found or already processed"]);
        exit();
    }

    $email = trim($registration["email"]);
    $firstName = $registration["first_name"];

    // ----------------------------------------
    // UPDATE TO REJECTED
    // ----------------------------------------
    $stmt = $pdo->prepare("
        UPDATE pending_registrations
        SET status = 'REJECTED', rejection_reason = ?, reviewed_at = NOW(), reviewed_by = ?
        WHERE registration_id = ?
    ");
    $stmt->execute([$reason, $_SESSION['admin_id'], $registrationId]);

    $pdo->commit();

    // ----------------------------------------
    // SEND REJECTION EMAIL
    // ----------------------------------------
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['MAIL_USER'];
        $mail->Password   = $_ENV['MAIL_PASS'];
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_NAME']);
        $mail->addAddress($email);

        $mail->Subject = 'Your TUA Marketplace Registration Has Been Rejected';

        // -------------------------------
        // HTML Email Body
        // -------------------------------
        $mail->isHTML(true);
        $mail->Body = <<<HTML
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width" />
            <title>TUA Marketplace Registration Rejected</title>
        </head>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Tahoma,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f5f5f5;">
                <tr><td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                        <tr>
                            <td style="background:linear-gradient(135deg,#8A1C1C 0%,#B62A2A 100%);padding:40px 30px;text-align:center;color:white;">
                                <h1 style="margin:0;font-size:28px;font-weight:600;">TUA Marketplace</h1>
                                <p style="margin-top:10px;font-size:16px;">Registration Status Update</p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:40px 30px;color:#333;font-size:16px;line-height:1.6;">
                                <h2 style="font-size:22px;font-weight:600;margin-bottom:15px;">Hello, {$firstName}</h2>

                                <p>Your registration request to join the <strong>TUA Marketplace</strong> has unfortunately been <strong style="color:#B62A2A;">rejected</strong>.</p>

                                <div style="background:#fdecea;border-left:4px solid #d9534f;padding:18px;border-radius:6px;margin:20px 0;">
                                    <p style="margin:0;font-size:15px;color:#a94442;">
                                        <strong>Reason Provided:</strong><br>
                                        {$reason}
                                    </p>
                                </div>

                                <p>If you believe this was a mistake or want to re-submit your registration, you may contact our support team.</p>

                                <table width="100%" style="margin:30px 0;">
                                    <tr><td align="center">
                                        <a href="mailto:tuamarketplace.support@gmail.com"
                                           style="background:#8A1C1C;color:white;padding:14px 35px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">
                                           Contact Support →
                                        </a>
                                    </td></tr>
                                </table>

                                <p style="text-align:center;color:#777;font-size:14px;margin-top:30px;">
                                    Thank you for your interest in joining the TUA Marketplace.
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="background:#2d2d2d;padding:25px 30px;text-align:center;">
                                <p style="margin:0;font-size:14px;color:#fff;font-weight:600;">TUA Marketplace</p>
                                <p style="margin:0;margin-top:5px;color:#999;font-size:12px;">
                                    This is an automated message. Please do not reply.<br>
                                    © 2025 TUA Marketplace. All rights reserved.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        HTML;

        $mail->AltBody = "Your TUA Marketplace registration was rejected.\nReason: {$reason}";
        $mail->send();

    } catch (Exception $e) {
        error_log("Rejection email failed: " . $mail->ErrorInfo);
    }

    echo json_encode(["success" => true, "message" => "Registration rejected and email sent"]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) { $pdo->rollBack(); }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
