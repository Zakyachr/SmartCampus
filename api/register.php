<?php
require_once 'config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $password = $data['password'] ?? '';
    $firstName = filter_var($data['first_name'] ?? '', FILTER_SANITIZE_STRING);
    $lastName = filter_var($data['last_name'] ?? '', FILTER_SANITIZE_STRING);
    $role = filter_var($data['role'] ?? '', FILTER_SANITIZE_STRING); // 'student' or 'teacher'

    if (!$email || empty($password) || empty($firstName) || empty($lastName) || !in_array($role, ['student', 'teacher'])) {
        http_response_code(400);
        echo json_encode(["error" => "Veuillez remplir tous les champs obligatoires correctement."]);
        exit();
    }

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(["error" => "Cet e-mail est déjà utilisé."]);
        exit();
    }

    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    try {
        $pdo->beginTransaction();

        // 1. Insert User
        $stmtUser = $pdo->prepare("INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)");
        $stmtUser->execute([$email, $password_hash, $role, $firstName, $lastName]);
        $userId = $pdo->lastInsertId();

        // 2. Insert role-specific profile details
        if ($role === 'student') {
            $major = filter_var($data['major'] ?? '', FILTER_SANITIZE_STRING);
            $level = filter_var($data['level'] ?? '', FILTER_SANITIZE_STRING);
            
            // Validate student level to conform to requirements (ING1 to ING3 only)
            if (!in_array($level, ['ING1', 'ING2', 'ING3'])) {
                $level = 'ING1'; // Default
            }

            // Generate unique student number
            $isUnique = false;
            $studentNumber = '';
            while (!$isUnique) {
                $studentNumber = 'ETU' . date('Y') . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
                $stmtCheck = $pdo->prepare("SELECT id FROM students WHERE student_number = ?");
                $stmtCheck->execute([$studentNumber]);
                if (!$stmtCheck->fetch()) {
                    $isUnique = true;
                }
            }

            $stmtStudent = $pdo->prepare("INSERT INTO students (id, student_number, major, level) VALUES (?, ?, ?, ?)");
            $stmtStudent->execute([$userId, $studentNumber, $major, $level]);
        } else {
            // Teacher role
            $department = filter_var($data['department'] ?? '', FILTER_SANITIZE_STRING);
            $stmtTeacher = $pdo->prepare("INSERT INTO teachers (id, department) VALUES (?, ?)");
            $stmtTeacher->execute([$userId, $department]);
        }

        $pdo->commit();

        http_response_code(201);
        echo json_encode([
            "message" => "Compte créé avec succès ! Vous pouvez maintenant vous connecter.",
            "user" => [
                "id" => $userId,
                "first_name" => $firstName,
                "last_name" => $lastName,
                "role" => $role
            ]
        ]);

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["error" => "Erreur serveur lors de la création du compte: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Méthode non autorisée."]);
}
?>
