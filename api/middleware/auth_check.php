<?php
session_start();

// Timeout de session - récupérer la durée depuis les paramètres (en minutes)
$session_timeout = 120; // Par défaut 120 minutes

// Vérifier le timeout d'inactivité
if (isset($_SESSION['last_activity'])) {
    $elapsed_time = time() - $_SESSION['last_activity'];
    $timeout_seconds = $session_timeout * 60; // Convertir minutes en secondes
    
    if ($elapsed_time > $timeout_seconds) {
        // Session expirée : détruire la session
        session_destroy();
        http_response_code(401);
        echo json_encode(["error" => "Session expirée. Veuillez vous reconnecter."]);
        exit();
    }
}

// Mettre à jour le timestamp de dernière activité
$_SESSION['last_activity'] = time();

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