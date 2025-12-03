<?php
include "connect_db.php"; // returns a $pdo instance
include "corsHeader.php";


 $input = json_decode(file_get_contents("php://input"), true);




 try {


    $query= "SELECT r.reviewed_user_id, CONCAT(u.first_name, ' ', u.last_name) AS reviewedUserName, AVG(r.rating) AS avg_rating, u.department, u.profile_pic, u.user_type 
             FROM leave_review r
             JOIN users u ON r.reviewed_user_id = u.user_id 
             WHERE r.time_stamp >= NOW() - INTERVAL 7 DAY AND u.is_banned = 0 AND r.reviewer_status = 'buyer'
            GROUP BY 
                r.reviewed_user_id, 
                reviewedUserName, 
                u.department, 
                u.profile_pic, 
                u.user_type
            ORDER BY avg_rating DESC 
            LIMIT 5 ";
   
    $stmt = $pdo->prepare($query);
    $stmt ->execute();


    $topSellers= $stmt->fetchAll(PDO::FETCH_ASSOC);


    echo json_encode($topSellers);


 }catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);  
 }
?>
