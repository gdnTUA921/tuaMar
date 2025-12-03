<?php

    include "corsHeader.php";
    include "connect_db.php";

    try{
        $input = json_decode(file_get_contents ("php://input"), true);

        $email = $input['email'] ?? null;
        $otp = $input['otp'] ?? null;

        if (!empty($email) && !empty($otp)){
            $query = "SELECT otp FROM one_time_pin WHERE email = :email AND date >= NOW() - INTERVAL 5 MINUTE ORDER BY date DESC";

            $stmt = $pdo->prepare($query);
            $stmt->execute([":email" => $email]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $otpDB = $result['otp'];

            if ($otpDB === $otp){
                $query2 = "DELETE FROM one_time_pin WHERE email = :email";

                $stmt2 = $pdo->prepare($query2);
                $result2 = $stmt2->execute([":email" => $email]);

                if ($result2){
                    $response = ["message" => "OTP Verified"];
                }

                else{
                    throw new PDOException ("Failed to Verify OTP");
                }
            }

            else{
                throw new PDOException ("OTP entered does not match");
            }
        }

        else{
            throw new PDOException ("Missing Required Fields");
        }

        echo json_encode($response);

    }

    catch (PDOException $e){
        echo json_encode(["error" => $e->getMessage()]);
    }

?>