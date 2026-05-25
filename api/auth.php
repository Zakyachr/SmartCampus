<?php
require_once 'config/db.php';
session_start();

$action = filter_input(INPUT_GET, 'action', FILTER_SANITIZE_STRING) ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["error" => "Email et mot de passe requis."]);
        exit();
    }

    $stmt = $pdo->prepare("SELECT id, password_hash, role, first_name, last_name FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Prévention de la fixation de session
        session_regenerate_id(true); 
        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        
        http_response_code(200);
        echo json_encode([
            "message" => "Connexion réussie",
            "user" => [
                "id" => $user['id'],
                "first_name" => $user['first_name'],
                "last_name" => $user['last_name'],
                "role" => $user['role']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Identifiants invalides."]);
    }
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'logout') {
    session_destroy();
    setcookie(session_name(), '', time() - 3600, '/');
    http_response_code(200);
    echo json_encode(["message" => "Déconnexion réussie"]);
    exit();
}

// Vérifier l'état de la session au chargement du frontend React
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'me') {
    if (isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare("SELECT id, role, first_name, last_name, email FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        if($user) {
            echo json_encode(["user" => $user]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Utilisateur non trouvé."]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Non connecté."]);
    }
    exit();
}
?>