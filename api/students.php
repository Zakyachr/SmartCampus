<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

// Les profs et admins peuvent voir la liste des étudiants
requireRole(['admin', 'teacher']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT u.id, u.first_name, u.last_name, u.email, s.student_number, s.major, s.level 
        FROM users u 
        JOIN students s ON u.id = s.id
    ");
    jsonResponse($stmt->fetchAll());
} 
elseif ($method === 'POST') {
    requireRole(['admin']); // Seul l'admin crée des étudiants
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $firstName = filter_var($data['first_name'] ?? '', FILTER_SANITIZE_STRING);
    $lastName = filter_var($data['last_name'] ?? '', FILTER_SANITIZE_STRING);
    $studentNumber = filter_var($data['student_number'] ?? '', FILTER_SANITIZE_STRING);
    $major = filter_var($data['major'] ?? '', FILTER_SANITIZE_STRING);
    $level = filter_var($data['level'] ?? '', FILTER_SANITIZE_STRING);
    
    if (empty($email) || empty($firstName) || empty($lastName) || empty($studentNumber)) {
        http_response_code(400);
        echo json_encode(["error" => "Veuillez remplir tous les champs obligatoires."]);
        exit();
    }

    // Mot de passe par défaut pour un nouvel utilisateur
    $defaultPassword = password_hash('password123', PASSWORD_BCRYPT);

    try {
        $pdo->beginTransaction();

        // 1. Insertion dans la table users
        $stmtUser = $pdo->prepare("INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (?, ?, 'student', ?, ?)");
        $stmtUser->execute([$email, $defaultPassword, $firstName, $lastName]);
        
        $userId = $pdo->lastInsertId();

        // 2. Insertion dans la table students
        $stmtStudent = $pdo->prepare("INSERT INTO students (id, student_number, major, level) VALUES (?, ?, ?, ?)");
        $stmtStudent->execute([$userId, $studentNumber, $major, $level]);

        $pdo->commit();
        jsonResponse(["message" => "Étudiant créé avec succès.", "id" => $userId], 201);

    } catch (PDOException $e) {
        $pdo->rollBack();
        if ($e->getCode() == 23000) {
            http_response_code(400);
            echo json_encode(["error" => "L'email ou le numéro étudiant existe déjà."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de la création de l'étudiant."]);
        }
    }
}
?>