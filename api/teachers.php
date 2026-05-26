<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Si admin : voir tous les profs
    if ($_SESSION['role'] === 'admin') {
        requireRole(['admin']);
        $stmt = $pdo->query("
            SELECT u.id, u.first_name, u.last_name, u.email, t.department 
            FROM users u 
            JOIN teachers t ON u.id = t.id
        ");
        jsonResponse($stmt->fetchAll());
    }
    // Si prof : voir ses élèves
    elseif ($_SESSION['role'] === 'teacher') {
        requireRole(['teacher']);
        $teacher_id = $_SESSION['user_id'];
        
        // Récupérer tous les élèves inscrits aux cours de ce prof
        $stmt = $pdo->prepare("
            SELECT DISTINCT 
                u.id, u.first_name, u.last_name, u.email,
                s.student_number, s.major, s.level,
                COUNT(e.course_id) as course_count
            FROM users u
            JOIN students s ON u.id = s.id
            JOIN enrollments e ON s.id = e.student_id
            JOIN courses c ON e.course_id = c.id
            WHERE c.teacher_id = ?
            GROUP BY u.id
            ORDER BY u.last_name, u.first_name
        ");
        $stmt->execute([$teacher_id]);
        jsonResponse($stmt->fetchAll());
    } else {
        requireRole(['admin', 'teacher']);
    }
} 
elseif ($method === 'POST') {
    requireRole(['admin']); // Seul l'administrateur peut créer les enseignants
    
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

    $defaultPassword = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

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
elseif ($method === 'DELETE') {
    requireRole(['admin']);
    
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID enseignant manquant ou invalide."]);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // 1. Détacher l'enseignant de ses cours (mettre teacher_id à NULL)
        $pdo->prepare("UPDATE courses SET teacher_id = NULL WHERE teacher_id = ?")->execute([$id]);

        // 2. Supprimer l'entrée dans teachers
        $pdo->prepare("DELETE FROM teachers WHERE id = ?")->execute([$id]);

        // 3. Supprimer l'utilisateur
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'teacher'");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(["error" => "Enseignant introuvable."]);
            exit();
        }

        $pdo->commit();
        jsonResponse(["message" => "Enseignant supprimé avec succès."]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de la suppression de l'enseignant."]);
    }
}
?>