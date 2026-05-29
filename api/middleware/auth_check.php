<?php
session_start();

function requireRole($allowed_roles) {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
        http_response_code(401);
        echo json_encode(["error" => "Non autorisé. Veuillez vous connecter."]);
        exit();
    }

    if (!in_array($_SESSION['role'], $allowed_roles)) {
        http_response_code(403);
        echo json_encode(["error" => "Accès refusé. Privilèges insuffisants."]);
        exit();
    }
}

// Utilitaires de réponse
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}
?>