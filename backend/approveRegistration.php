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


// -------------------------
// AUTH CHECK
// -------------------------
if (!isset($_SESSION['admin_id']) || !isset($_SESSION['email'])) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

// -------------------------
// INPUT
// -------------------------
$data = json_decode(file_get_contents("php://input"), true);
$registrationId = $data['registration_id'] ?? null;

if (!$registrationId) {
    echo json_encode(["success" => false, "message" => "Missing registration ID"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // ----------------------------------------
    // FETCH PENDING REGISTRATION
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

    // ----------------------------------------
    // VARIABLES
    // ----------------------------------------
    $idNumber   = $registration["school_id"];
    $firstName  = $registration["first_name"];
    $lastName   = $registration["last_name"];
    $department = $registration["department"];
    $email      = trim($registration["email"]);
    $userType   = "Student";
    $profilePic = "/tuamar-profile-icon.jpg";
    $fbUID      = "N/A";

    // ----------------------------------------
    // EMAIL VALIDATION
    // ----------------------------------------
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format."]);
        exit();
    }

    if (!preg_match('/@tua\.edu\.ph$/i', $email)) {
        echo json_encode(["success" => false, "message" => "Email must end with @tua.edu.ph"]);
        exit();
    }

    // ----------------------------------------
    // DUPLICATE CHECKS
    // ----------------------------------------
    $check = $pdo->prepare("SELECT user_id FROM users WHERE id_number = ?");
    $check->execute([$idNumber]);
    if ($check->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "ID number already in use."]);
        exit();
    }

    $check2 = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
    $check2->execute([$email]);
    if ($check2->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "Email already in use."]);
        exit();
    }


    // ----------------------------------------
    // INSERT USER
    // ----------------------------------------
    $stmt = $pdo->prepare("
        INSERT INTO users
        (id_number, first_name, last_name, department, email, user_type, profile_pic, fb_uid, is_banned)
        VALUES (:id_number, :first_name, :last_name, :department, :email, :user_type, :profile_pic, :fb_uid, 0)
    ");

    $stmt->execute([
        ':id_number'  => $idNumber,
        ':first_name' => $firstName,
        ':last_name'  => $lastName,
        ':department' => $department,
        ':email'      => $email,
        ':user_type'  => $userType,
        ':profile_pic'=> $profilePic,
        ':fb_uid'     => $fbUID,
    ]);


    // ----------------------------------------
    // UPDATE PENDING STATUS
    // ----------------------------------------
    $stmt = $pdo->prepare("
        UPDATE pending_registrations
        SET status = 'APPROVED', reviewed_at = NOW(), reviewed_by = ?
        WHERE registration_id = ?
    ");
    $stmt->execute([$_SESSION['admin_id'], $registrationId]);

    $pdo->commit();


    // ----------------------------------------
    // SEND PREMIUM HTML EMAIL
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

        $mail->Subject = 'Your Registration on TUA Marketplace Has Been Approved!';

        // ----------------------------------------
        // HTML BODY TEMPLATE (PROFESSIONAL & APPEALING)
        // ----------------------------------------
        $mail->isHTML(true);
        $mail->Body = <<<HTML
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TUA Marketplace Registration Approved</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <!-- Main Container -->
                        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                            
                            <!-- Header with Logo/Brand -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #547B3E 0%, #6a9b4f 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">
                                        🎉 Welcome to TUA Marketplace
                                    </h1>
                                    <p style="margin: 10px 0 0 0; color: #e8f5e9; font-size: 16px;">
                                        Your Account Has Been Approved
                                    </p>
                                </td>
                            </tr>

                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <!-- Greeting -->
                                    <h2 style="margin: 0 0 20px 0; color: #2d2d2d; font-size: 24px; font-weight: 600;">
                                        Hello, {$firstName}! 👋
                                    </h2>
                                    
                                    <!-- Success Message -->
                                    <div style="background-color: #e8f5e9; border-left: 4px solid #547B3E; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #2d5016; font-size: 16px; line-height: 1.6;">
                                            <strong>Great news!</strong> Your registration has been approved by our administrator. You're now part of the TUA Marketplace community! 🎊
                                        </p>
                                    </div>

                                    <!-- What's Next Section -->
                                    <h3 style="margin: 30px 0 15px 0; color: #547B3E; font-size: 20px; font-weight: 600;">
                                        What's Next?
                                    </h3>
                                    
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                                        <tr>
                                            <td style="padding: 15px 0; border-bottom: 1px solid #e0e0e0;">
                                                <span style="font-size: 24px; margin-right: 10px;">🔐</span>
                                                <span style="color: #2d2d2d; font-size: 15px;">Log in to your account</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 15px 0; border-bottom: 1px solid #e0e0e0;">
                                                <span style="font-size: 24px; margin-right: 10px;">🛍️</span>
                                                <span style="color: #2d2d2d; font-size: 15px;">Browse listings from fellow students</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 15px 0; border-bottom: 1px solid #e0e0e0;">
                                                <span style="font-size: 24px; margin-right: 10px;">📦</span>
                                                <span style="color: #2d2d2d; font-size: 15px;">Post your own items for sale</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 15px 0;">
                                                <span style="font-size: 24px; margin-right: 10px;">💬</span>
                                                <span style="color: #2d2d2d; font-size: 15px;">Connect with buyers and sellers</span>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 35px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="https://tuamarketplace.online" 
                                                   style="display: inline-block; background-color: #547B3E; color: #ffffff; 
                                                          padding: 16px 40px; text-decoration: none; border-radius: 8px; 
                                                          font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(84, 123, 62, 0.3);
                                                          transition: background-color 0.3s;">
                                                    Get Started Now →
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Help Text -->
                                    <p style="margin: 30px 0 0 0; color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
                                        Need help getting started? Our support team is here for you!
                                    </p>

                                </td>
                            </tr>

                            <!-- Contact Information Box -->
                            <tr>
                                <td style="padding: 0 30px 40px 30px;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 8px; overflow: hidden;">
                                        <tr>
                                            <td style="background-color: #547B3E; padding: 15px 20px;">
                                                <h4 style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                                                    📞 Contact Support
                                                </h4>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 20px;">
                                                <table width="100%" cellpadding="8" cellspacing="0" border="0">
                                                    <tr>
                                                        <td width="30%" style="color: #666; font-size: 14px; font-weight: 600;">📱 Phone:</td>
                                                        <td style="color: #2d2d2d; font-size: 14px;">0927 914 2603</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #666; font-size: 14px; font-weight: 600;">✉️ Email:</td>
                                                        <td>
                                                            <a href="mailto:tuamarketplace.support@gmail.com" 
                                                               style="color: #547B3E; text-decoration: none; font-size: 14px;">
                                                                tuamarketplace.support@gmail.com
                                                            </a>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #666; font-size: 14px; font-weight: 600;">🏢 Office:</td>
                                                        <td style="color: #2d2d2d; font-size: 14px;">TUA - CEIS, SSC Building (4th Floor)</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #2d2d2d; padding: 25px 30px; text-align: center;">
                                    <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 600;">
                                        TUA Marketplace
                                    </p>
                                    <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.5;">
                                        This is an automated message. Please do not reply to this email.<br>
                                        © 2025 TUA Marketplace. All rights reserved.
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        HTML;

        // ----------------------------------------
        // ALT BODY (Plain text - Enhanced)
        // ----------------------------------------
        $mail->AltBody =
"=====================================
TUA MARKETPLACE - REGISTRATION APPROVED
=====================================

Hello {$firstName},

GREAT NEWS! 🎉

Your registration has been approved by our administrator. You're now officially part of the TUA Marketplace community!

WHAT'S NEXT?
-------------
✓ Log in to your account
✓ Browse listings from fellow students  
✓ Post your own items for sale
✓ Connect with buyers and sellers

GET STARTED:
Visit: https://tuamarketplace.online

NEED HELP?
----------
📱 Phone: 0927 914 2603
✉️ Email: tuamarketplace.support@gmail.com
🏢 Office: TUA - CEIS, SSC Building (4th Floor)

This is an automated message. Please do not reply to this email.

© 2025 TUA Marketplace. All rights reserved.";

        $mail->send();
    } catch (Exception $e) {
        error_log("Email sending failed: " . $mail->ErrorInfo);
    }

    echo json_encode(["success" => true, "message" => "Registration approved successfully"]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>