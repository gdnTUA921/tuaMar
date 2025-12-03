<?php

include "corsHeader.php";
include "connect_db.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';
require 'phpmailer/src/Exception.php';

require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

try {
    $input = json_decode(file_get_contents("php://input"), true);
    $email = $input['email'] ?? null;

    if (!empty($email)) {
        // Check if email exists
        $query1 = "SELECT COUNT(email) AS emailCount FROM admin_tbl WHERE email = :email";
        $stmt1 = $pdo->prepare($query1);
        $stmt1->execute([":email" => $email]);

        $result1 = $stmt1->fetch(PDO::FETCH_ASSOC); 
        $email_count = (int) $result1['emailCount']; 

        if ($email_count === 0) {
            $response = ["message" => "Email not registered."];
        } else {
            $otp = rand(100000, 999999);

            $query2 = "INSERT INTO one_time_pin (email, otp) VALUES (:email, :otp)";
            $stmt2 = $pdo->prepare($query2);
            $result2 = $stmt2->execute([
                ":email" => $email,
                ":otp" => $otp,
            ]);

            if ($result2) {
                $response = ["message" => sendEmail($otp, $email)]; // Fixed: was $otc, now $otp
            } else {
                throw new PDOException("Failed to Generate One-Time Pin");
            }
        }
    } else {
        throw new PDOException("Missing Required Fields.");
    }

    echo json_encode($response);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}



function sendEmail($otp, $email) {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = $_ENV['MAIL_USER'];
        $mail->Password = $_ENV['MAIL_PASS']; 
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        // Recipients
        $mail->setFrom('bangusdevs@gmail.com', 'TUA Marketplace');
        $mail->addAddress($email);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'TUA Marketplace - One Time Pin Verification for Password Reset';
        $mail->Body    = '
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>TUA Marketplace - One-Time Pin Verification</title>
            </head>
            <body style="font-family: \'Segoe UI\', Roboto, sans-serif; background-color: #f4f4f4; padding: 20px; color: #2d2d2d;">
                <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 25px;">
                    <div style="border-bottom: 3px solid #547B3E; padding-bottom: 10px; margin-bottom: 25px;">
                        <h2 style="color: #547B3E; margin: 0;">TUA Marketplace - Account Verification</h2>
                    </div>

                    <h3 style="color: #444;">Dear '.$email.',</h3>
                    
                    <p style="line-height: 1.6;">Thank you for accessing TUA Marketplace. To ensure the security of your account, we have generated a One-Time Pin (OTP) for verification purposes.</p>

                    <div style="text-align: center; margin: 30px 0; background-color: #f0f7f0; padding: 25px; border-radius: 6px; border: 2px solid #547B3E;">
                        <p style="margin: 0 0 10px 0; font-size: 16px; color: #547B3E;"><strong>Your One-Time Code is:</strong></p>
                        <div style="font-size: 32px; font-weight: bold; color: #547B3E; letter-spacing: 4px; font-family: \'Courier New\', monospace; background: #ffffff; padding: 15px; border-radius: 4px; border: 1px solid #547B3E;">
                            '.$otp.'
                        </div>
                    </div>

                    <p style="line-height: 1.6;">Please enter this code in the verification prompt to proceed. Once verified, you can now reset your password.</p>

                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
                        <p style="margin: 0; color: #856404;"><strong>⚠️ Important Security Notice:</strong></p>
                        <p style="margin: 5px 0 0 0; color: #856404;">Do not share this code with anyone. TUA Marketplace staff will never ask for your verification code.</p>
                    </div>

                    <p style="line-height: 1.6;">If you did not request this code, please ignore this email or contact our support team immediately.</p>

                    <hr style="margin: 30px 0;" />
                    
                    <h4 style="color: #547B3E;">Need Help? Contact Us:</h4>
                    <div style="background-color: #f0f7f0; padding: 15px; border-radius: 6px;">
                        <p style="margin: 5px 0;"><strong>Phone:</strong> 0927 914 2603</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:tuamarketplace.support@gmail.com" style="color: #547B3E;">tuamarketplace.support@gmail.com</a></p>
                        <p style="margin: 5px 0;"><strong>Office:</strong> TUA - CEIS, SSC Building (4th Floor)</p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="line-height: 1.6;">Best regards,<br><strong style="color: #547B3E;">TUA Marketplace Team</strong></p>
                    </div>

                    <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
                        This is an automated message. Please do not reply directly to this email.<br>
                        This verification code will expire in 5 minutes for security purposes.
                    </p>
                </div>
            </body>
            </html>';

        $mail->AltBody = "TUA Marketplace - Account Verification\n\n"
            . "Dear {$email},\n\n"
            . "Thank you for accessing TUA Marketplace. To ensure the security of your account, we have generated a One-Time Pin (OTP) for verification purposes.\n\n"
            . "Your One-Time Code is: {$otp}\n\n"
            . "Please enter this code in the verification prompt to proceed. Once verified, you can reset your password.\n\n"
            . "⚠️ Important Security Notice:\n"
            . "Do not share this code with anyone. TUA Marketplace staff will never ask for your verification code.\n\n"
            . "If you did not request this code, please ignore this email or contact our support team immediately.\n\n"
            . "Need Help? Contact Us:\n"
            . "Phone: 0927 914 2603\n"
            . "Email: tuamarketplace.support@gmail.com\n"
            . "Office: TUA - CEIS, SSC Building (4th Floor)\n\n"
            . "Best regards,\n"
            . "TUA Marketplace Team\n\n"
            . "This is an automated message. Please do not reply directly to this email.\n"
            . "This verification code will expire in 5 minutes for security purposes.";

        $mail->CharSet = 'UTF-8';
        $mail->send();
        return "One-Time Pin sent successfully.";
    } catch (Exception $e) {
        return "Email could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
}
?>