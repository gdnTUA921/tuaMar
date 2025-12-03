<?php
require_once __DIR__ . '/vendor/autoload.php';

use Kreait\Firebase\Factory;

function getFirebase() {
    return (new Factory)
        ->withServiceAccount(__DIR__ . '/tua-market-firebase-adminsdk-fbsvc-0bacb503ad.json')
        ->withDatabaseUri('https://tua-market-default-rtdb.asia-southeast1.firebasedatabase.app')
        ->withDefaultStorageBucket('tua-market-register-uploads');
}

function getFirebaseAuth() {
    return getFirebase()->createAuth();
}

function getFirebaseDatabase() {
    return getFirebase()->createDatabase();
}

function getFirebaseStorage() {
    return getFirebase()->createStorage();
}
?>