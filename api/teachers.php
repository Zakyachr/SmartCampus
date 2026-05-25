<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

requireRole(['admin']); // Seul l'administrateur peut gérer les enseignants

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT u.id, u.first_name, u.last_name, u.email, t.department 
        FROM users u 
        JOIN teachers t ON u.id = t.id
    ");
    jsonResponse($stmt->fetchAll());
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $firstName = filter_var($data['first_name'] ?? '', FILTER_SANITIZE_STRING);
    $lastName = filter_var($data['last_name'] ?? '', FILTER_SANITIZE_STRING);
    $department = filter_var($data['department'] ?? '', FILTER_SANITIZE_STRING);
    
    if (empty($email) || empty($firstName) || empty($lastName) || empty($department)) {
        http_response_code(400);
        echo json_encode(["error" => "Veuillez remplir tous les champs obligatoires."]);
        exit();
    }

    $defaultPassword = password_hash('password123', PASSWORD_BCRYPT);

    try {
        $pdo->beginTransaction();

        // Insertion dans users
        $stmtUser = $pdo->prepare("INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (?, ?, 'teacher', ?, ?)");
        $stmtUser->execute([$email, $defaultPassword, $firstName, $lastName]);
        
        $userId = $pdo->lastInsertId();

        // Insertion dans teachers
        $stmtTeacher = $pdo->prepare("INSERT INTO teachers (id, department) VALUES (?, ?)");
        $stmtTeacher->execute([$userId, $department]);

        $pdo->commit();
        jsonResponse(["message" => "Enseignant créé avec succès.", "id" => $userId], 201);

    } catch (PDOException $e) {
        $pdo->rollBack();
        if ($e->getCode() == 23000) {
            http_response_code(400);
            echo json_encode(["error" => "L'email existe déjà."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de la création de l'enseignant."]);
        }
    }
}
?>