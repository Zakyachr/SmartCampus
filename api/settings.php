<?php
require_once 'middleware/auth_check.php';

requireRole(['admin', 'teacher', 'student']);

$method = $_SERVER['REQUEST_METHOD'];

// Paramètres par défaut
$defaultSettings = [
    'cc1_weight' => 30,
    'cc2_weight' => 30,
    'exam_weight' => 40,
    'pass_threshold' => 10,
    'mention_ab' => 12,
    'mention_b' => 14,
    'mention_tb' => 16,
];

if ($method === 'GET') {
    // Retourner les paramètres académiques pour le calcul des notes
    jsonResponse($defaultSettings);
}

function jsonResponse($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}
?>
