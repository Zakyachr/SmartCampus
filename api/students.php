<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Les profs et admins peuvent voir la liste des étudiants
    requireRole(['admin', 'teacher', 'student']);
    
    // Si c'est un étudiant qui demande ses inscriptions
    if ($_SESSION['role'] === 'student' && isset($_GET['enrolled']) && $_GET['enrolled'] === 'true') {
        $stmt = $pdo->prepare("
            SELECT c.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                   s.day_of_week, s.start_time, s.end_time, s.room
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN users u ON c.teacher_id = u.id
            LEFT JOIN schedules s ON c.id = s.course_id
            WHERE e.student_id = ?
            ORDER BY c.title
        ");
        $stmt->execute([$_SESSION['user_id']]);
        jsonResponse($stmt->fetchAll());
    }
    // Si c'est pour récupérer les inscriptions d'un cours
    elseif (isset($_GET['course_id'])) {
        requireRole(['admin', 'teacher']);
        
        $course_id = filter_var($_GET['course_id'], FILTER_VALIDATE_INT);
        
        $stmt = $pdo->prepare("
            SELECT DISTINCT 
                u.id, u.first_name, u.last_name, u.email,
                s.student_number, s.major, s.level
            FROM users u
            JOIN students s ON u.id = s.id
            JOIN enrollments e ON s.id = e.student_id
            WHERE e.course_id = ?
            ORDER BY u.last_name, u.first_name
        ");
        $stmt->execute([$course_id]);
        jsonResponse($stmt->fetchAll());
    }
    // Sinon, liste générale des étudiants
    else {
        requireRole(['admin', 'teacher']);
        
        $stmt = $pdo->query("
            SELECT u.id, u.first_name, u.last_name, u.email, s.student_number, s.major, s.level, s.date_of_birth 
            FROM users u 
            JOIN students s ON u.id = s.id
        ");
        jsonResponse($stmt->fetchAll());
    }
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

    // Mot de passe par défaut pour un nouvel utilisateur (hash pour "password")
    $defaultPassword = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

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
elseif ($method === 'DELETE') {
    requireRole(['admin']);
    
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID étudiant manquant ou invalide."]);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // 1. Supprimer les notes liées aux inscriptions de cet étudiant
        $pdo->prepare("DELETE FROM grades WHERE enrollment_id IN (SELECT id FROM enrollments WHERE student_id = ?)")->execute([$id]);

        // 2. Supprimer les inscriptions
        $pdo->prepare("DELETE FROM enrollments WHERE student_id = ?")->execute([$id]);

        // 3. Supprimer l'entrée dans students
        $pdo->prepare("DELETE FROM students WHERE id = ?")->execute([$id]);

        // 4. Supprimer l'utilisateur
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'student'");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(["error" => "Étudiant introuvable."]);
            exit();
        }

        $pdo->commit();
        jsonResponse(["message" => "Étudiant supprimé avec succès."]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de la suppression de l'étudiant."]);
    }
}
?>