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

        //Setting up input variables
        $idNumber = $input["idNumber"];
        $firstName = $input["firstName"];
        $lastName = $input["lastName"];
        $department = $input["department"];
        $email = trim($input["email"]); // Trim email
        $userType = $input["typeUser"];
        $profilePic = "/tuamar-profile-icon.jpg";
        $fbUID = "N/A";


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


        //Checking first if ID number inputted is already in use by another user
        $check = $pdo->prepare("SELECT user_id FROM users WHERE id_number = :id_number");
        $check->execute(['id_number' => $idNumber]);
        if ($check->rowCount() > 0) {
            echo json_encode(["success" => false, "message" => "ID number already in use."]);
            exit;
        }

        //Next, checking if email inputted is already in use by another user
        $check2 = $pdo->prepare("SELECT user_id FROM users WHERE email = :email");
        $check2->execute(['email' => $email]);
        if ($check2->rowCount() > 0) {
            echo json_encode(["success" => false, "message" => "Email already in use."]);
            exit;
        }

        //If both ID number and email are unique, proceed to insert new user
        $query = "INSERT INTO users (id_number, first_name, last_name, department, email, user_type, profile_pic, fb_uid, is_banned)
                  VALUES (:id_number, :first_name, :last_name, :department, :email, :user_type, :profile_pic, :fb_uid, :is_banned);";

        $stmt = $pdo->prepare($query);

        $result = $stmt->execute([
            ':id_number'  => $idNumber,
            ':first_name' => $firstName,
            ':last_name' => $lastName,
            ':department' => $department,
            ':email' => $email,
            ':user_type' => $userType,
            ':profile_pic' => $profilePic,
            ':fb_uid' => $fbUID,
            ':is_banned' => 0,
        ]);


        if ($result){

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
                $mail->addAddress($email);
                $mail->Subject = 'Welcome to TUA Marketplace! -- Successful Registration';
                $mail->isHTML(true);
                $mail->Body = <<<HTML
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>TUA Marketplace Registration</title>
                    </head>
                    <body style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4; padding: 20px; color: #2d2d2d;">
                        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 25px;">
                            <div style="border-bottom: 3px solid #547B3E; padding-bottom: 10px; margin-bottom: 25px;">
                                <h2 style="color: #547B3E; margin: 0;">Welcome to TUA Marketplace!</h2>
                            </div>

                            <h3 style="color: #444;">Hello {$firstName},</h3>
                            <p style="line-height: 1.6;">
                                Congratulations! 🎉 You are now successfully registered to <strong style="color: #547B3E;">TUA Marketplace</strong>.
                            </p>

                            <p style="line-height: 1.6;">
                                You can now log in and explore the marketplace, post your listings, and connect with other members of the TUA community.
                            </p>

                            <div style="text-align: center; margin: 25px 0;">
                                <a href="https://tuamarketplace.online" style="background-color: #547B3E; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                                    Go to TUA Marketplace
                                </a>
                            </div>

                            <p style="line-height: 1.6;">
                                If you have any questions or need assistance, feel free to contact us at 
                                <a href="mailto:tuamarketplace.support@gmail.com" style="color: #547B3E;">tuamarketplace.support@gmail.com</a>.
                            </p>

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

                $mail->AltBody = "Welcome to TUA Marketplace!\n\n"
                    . "Hello {$firstName},\n\n"
                    . "Congratulations! You are now successfully registered to TUA Marketplace.\n\n"
                    . "You can now log in, explore the marketplace, post your listings, and connect with other members of the TUA community.\n\n"
                    . "Visit: https://tuamarketplace.online\n\n"
                    . "If you have any questions or need assistance, feel free to contact us:\n"
                    . "Phone: 0927 914 2603\n"
                    . "Email: tuamarketplace.support@gmail.com\n"
                    . "Office: TUA - CEIS, SSC Building (4th Floor)\n\n"
                    . "This is an automated message. Please do not reply directly to this email.";
                
                $mail->send();

            } catch (Exception $e) {
                error_log("Email sending failed: " . $mail->ErrorInfo);
            }

            $response = ["status" => "Success", "message" => "User Registered Successfully!"];
            echo json_encode($response);
        }

        else {
            throw new Exception("Failed to Register User.");
        }
        
    } 
    
    catch (Exception $e) {
        $response = ["status" => "Failed", "message" => "Error: " . $e->getMessage()];
        echo json_encode($response);
    }

?>

    