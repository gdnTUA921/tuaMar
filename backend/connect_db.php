<?php

//DB CONNECTION
//host is public database IP address from Google Cloud SQL
//username and password are the ones you set when creating the Cloud SQL instance
//dbname is the name of your database

require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$connectionName = $_ENV['DB_INSTANCE_CONNECTION_NAME'];
$dbUser = $_ENV['DB_USER'];
$dbPassword = $_ENV['DB_PASSWORD'];
$dbName = $_ENV['DB_NAME'];


try {
    $pdo = new PDO("mysql:unix_socket=/cloudsql/$connectionName;dbname=$dbName", $dbUser, $dbPassword);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}


