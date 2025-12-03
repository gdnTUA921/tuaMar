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

    try {

        $input = json_decode(file_get_contents("php://input"), true);

        $senderID = $input["senderID"];
        $receiverID = $input["receiverID"];
        $itemName = $input["itemName"];
        $itemPic = $input["itemPic"];
        $messageText = $input["messageText"];


        //Query Receiver Name and Email
        $query1 = "SELECT first_name, email FROM users WHERE fb_uid = :receiverID";
        $stmt1 = $pdo->prepare($query1);
        $stmt1->execute([':receiverID' => $receiverID]);
        $receiver = $stmt1->fetch(PDO::FETCH_ASSOC);


        if ($receiver) {
            $receiverName = $receiver["first_name"];
            $receiverEmail = $receiver["email"];

            //Query Sender Name
            $query2 = "SELECT first_name, last_name FROM users WHERE fb_uid = :senderID";
            $stmt2 = $pdo->prepare($query2);
            $stmt2->execute([':senderID' => $senderID]);
            $sender = $stmt2->fetch(PDO::FETCH_ASSOC);

            if ($sender) {
                $senderName = $sender["first_name"] . " " . $sender["last_name"];

                if ($messageText == "image") {
                    $messageText = "📷 " . $senderName . " sent you an image.";
                }

                //Send Email Notification to Receiver
                echo json_encode(sendEmail($senderName, $receiverName, $receiverEmail, $itemName, $itemPic, $messageText));
            }
        }
    }

    catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        exit;
    }



    function sendEmail($senderName, $receiverName, $receiverEmail, $itemName, $itemPic, $messageText) {
        $mail = new PHPMailer(true);

        try {
            //Server settings (For Production - Gmail SMTP)
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = $_ENV['MAIL_USER'];
            $mail->Password = $_ENV['MAIL_PASS']; 
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            /*Server settings (For Dev - Mailtrap SMTP)
            $mail->isSMTP();
            $mail->Host = 'sandbox.smtp.mailtrap.io';
            $mail->SMTPAuth = true;
            $mail->Username = $_ENV['MAIL_USER_DEV'];
            $mail->Password = $_ENV['MAIL_PASS_DEV']; 
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 2525;*/

            // Recipients
            $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_NAME']);
            $mail->addAddress($receiverEmail);

            // Content
            $mail->isHTML(true);
            $mail->Subject = 'TUA Marketplace - New Message Notification Regarding '. $itemName;
            $mail->Body    = <<<HTML
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>TUA Marketplace - New Message Notification</title>
                </head>
                <body style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4; padding: 20px; color: #2d2d2d;">
                    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 25px;">
                        
                        <!-- Header -->
                        <div style="border-bottom: 3px solid #547B3E; padding-bottom: 10px; margin-bottom: 25px;">
                            <h2 style="color: #547B3E; margin: 0;">TUA Marketplace Notification</h2>
                        </div>

                        <!-- Main content -->
                        <h3 style="color: #444;">Hello, {$receiverName}!</h3>
                        <p style="line-height: 1.6;">
                            You have received a <strong style="color: #547B3E;">new message</strong> from 
                            <strong>{$senderName}</strong> regarding the item 
                            <strong style="color: #333;">{$itemName}</strong>.
                        </p>

                        <!-- Item preview -->
                        <div style="text-align: center; margin: 20px 0;">
                            <img src="{$itemPic}" alt="Item Image" style="max-width: 300px; border-radius: 10px; border: 2px solid #ccc;" />
                        </div>

                        <!-- Message preview -->
                        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #547B3E; border-radius: 6px; margin-bottom: 20px;">
                            <p style="margin: 0; font-style: italic;">“{$messageText}”</p>
                        </div>

                        <p style="line-height: 1.6;">
                            To view and reply to this message, please log in to your 
                            <a href="https://tuamarketplace.online/login" style="color: #547B3E; text-decoration: none; font-weight: 500;">TUA Marketplace account</a>.
                        </p>

                        <p style="line-height: 1.6;">
                            Prompt communication helps maintain a trustworthy and active marketplace community. We encourage you to respond to inquiries as soon as possible.
                        </p>

                        <!-- Contact -->
                        <hr style="margin: 30px 0;" />
                        <h4 style="color: #547B3E;">Need Assistance?</h4>
                        <div style="background-color: #f0f7f0; padding: 15px; border-radius: 6px;">
                            <p><strong>Phone:</strong> 0915 123 4567</p>
                            <p><strong>Email:</strong> <a href="mailto:tuamarketplace.support@gmail.com" style="color: #547B3E;">tuamarketplace.support@gmail.com</a></p>
                            <p><strong>Office:</strong> TUA - University Student Council, SSC Building (2nd Floor)</p>
                        </div>

                        <!-- Footer -->
                        <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
                            This is an automated message from TUA Marketplace. Please do not reply directly to this email.
                        </p>
                    </div>
                </body>
                </html>
                HTML;

            $mail->AltBody = <<<ALT
                    TUA Marketplace Notification

                    Hello, {$receiverName}!

                    You have received a NEW MESSAGE from {$senderName} regarding the item "{$itemName}".

                    Message Preview:
                    "{$messageText}"

                    To view and reply to this message, please log in to your TUA Marketplace account:
                    https://tuamarketplace.online/login

                    Prompt communication helps maintain a trustworthy and active marketplace community. 
                    We encourage you to respond to inquiries as soon as possible.

                    -----------------------------------------
                    Need Assistance?
                    Phone: 0927 914 2603
                    Email: tuamarketplace.support@gmail.com
                    Office: TUA - University Student Council, SSC Building (2nd Floor)
                    -----------------------------------------

                    This is an automated message from TUA Marketplace. 
                    Please do not reply directly to this email.
                    ALT;

            $mail->CharSet = 'UTF-8';
            $mail->send();
            return "Email Sent Successfully.";
        } catch (Exception $e) {
            return "Email could not be sent. Mailer Error: {$mail->ErrorInfo}";
        }
    }