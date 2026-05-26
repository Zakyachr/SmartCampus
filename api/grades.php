<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

requireRole(['teacher', 'admin', 'student']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Si étudiant : ne voit que ses notes
    if ($_SESSION['role'] === 'student') {
        $stmt = $pdo->prepare("
            SELECT g.*, c.title as course_title, c.code as course_code, 
                   u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM grades g
            JOIN enrollments e ON g.enrollment_id = e.id
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN users u ON c.teacher_id = u.id
            WHERE e.student_id = ?
        ");
        $stmt->execute([$_SESSION['user_id']]);
        jsonResponse($stmt->fetchAll());
    } 
    // Si enseignant : voit les notes de ses cours
    elseif ($_SESSION['role'] === 'teacher') {
        $teacher_id = $_SESSION['user_id'];
        
        // Optionnel: filtrer par course_id si fourni
        $course_id = filter_var($_GET['course_id'] ?? null, FILTER_VALIDATE_INT);
        
        if ($course_id) {
            $stmt = $pdo->prepare("
                SELECT g.*, e.id as enrollment_id, u.first_name, u.last_name, s.student_number,
                       c.title as course_title, c.code as course_code
                FROM grades g
                JOIN enrollments e ON g.enrollment_id = e.id
                JOIN users u ON e.student_id = u.id
                JOIN students s ON u.id = s.id
                JOIN courses c ON e.course_id = c.id
                WHERE c.teacher_id = ? AND c.id = ?
                ORDER BY u.last_name, u.first_name
            ");
            $stmt->execute([$teacher_id, $course_id]);
        } else {
            $stmt = $pdo->prepare("
                SELECT g.*, e.id as enrollment_id, u.first_name, u.last_name, s.student_number,
                       c.title as course_title, c.code as course_code
                FROM grades g
                JOIN enrollments e ON g.enrollment_id = e.id
                JOIN users u ON e.student_id = u.id
                JOIN students s ON u.id = s.id
                JOIN courses c ON e.course_id = c.id
                WHERE c.teacher_id = ?
                ORDER BY c.title, u.last_name, u.first_name
            ");
            $stmt->execute([$teacher_id]);
        }
        jsonResponse($stmt->fetchAll());
    }
    // Si admin : voit toutes les notes
    elseif ($_SESSION['role'] === 'admin') {
        $stmt = $pdo->query("
            SELECT g.*, e.id as enrollment_id, u.first_name, u.last_name, s.student_number,
                   c.title as course_title, prof.first_name as teacher_first_name, prof.last_name as teacher_last_name
            FROM grades g
            JOIN enrollments e ON g.enrollment_id = e.id
            JOIN users u ON e.student_id = u.id
            JOIN students s ON u.id = s.id
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN users prof ON c.teacher_id = prof.id
            ORDER BY c.title, u.last_name, u.first_name
        ");
        jsonResponse($stmt->fetchAll());
    }
} 
elseif ($method === 'PUT') {
    requireRole(['teacher', 'admin']); // Seul le prof ou l'admin peut noter
    
    $data = json_decode(file_get_contents("php://input"), true);
    $enrollment_id = filter_var($data['enrollment_id'] ?? null, FILTER_VALIDATE_INT);
    $cc1 = isset($data['cc1']) ? filter_var($data['cc1'], FILTER_VALIDATE_FLOAT) : null;
    $cc2 = isset($data['cc2']) ? filter_var($data['cc2'], FILTER_VALIDATE_FLOAT) : null;
    $final_exam = isset($data['final_exam']) ? filter_var($data['final_exam'], FILTER_VALIDATE_FLOAT) : null;
    
    if (!$enrollment_id) {
        http_response_code(400);
        echo json_encode(["error" => "ID d'inscription manquant."]);
        exit();
    }

    // Vérifier que le prof est bien celui du cours (sauf s'il est admin)
    if ($_SESSION['role'] === 'teacher') {
        $stmtCheck = $pdo->prepare("
            SELECT c.teacher_id FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.id = ?
        ");
        $stmtCheck->execute([$enrollment_id]);
        $teacher_id = $stmtCheck->fetchColumn();
        
        if ($teacher_id !== $_SESSION['user_id']) {
            http_response_code(403);
            echo json_encode(["error" => "Vous n'avez pas la permission de noter cet étudiant."]);
            exit();
        }
    }

    // Calcul de la moyenne (30% CC1, 30% CC2, 40% Examen)
    $final_grade = null;
    if ($cc1 !== null && $cc2 !== null && $final_exam !== null) {
        $final_grade = ($cc1 * 0.3) + ($cc2 * 0.3) + ($final_exam * 0.4);
    }

    // Vérifier que le cours n'est pas verrouillé ("validé")
    $stmtCheckStatus = $pdo->prepare("
        SELECT c.status FROM courses c 
        JOIN enrollments e ON c.id = e.course_id 
        WHERE e.id = ?
    ");
    $stmtCheckStatus->execute([$enrollment_id]);
    $courseStatus = $stmtCheckStatus->fetchColumn();

    if ($courseStatus === 'validé') {
        http_response_code(403);
        echo json_encode(["error" => "Les notes de ce cours sont verrouillées après validation finale."]);
        exit();
    }

    // Mise à jour de la note (Utilisation de INSERT ... ON DUPLICATE KEY UPDATE)
    $stmt = $pdo->prepare("
        INSERT INTO grades (enrollment_id, cc1, cc2, final_exam, final_grade) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        cc1 = VALUES(cc1), cc2 = VALUES(cc2), final_exam = VALUES(final_exam), final_grade = VALUES(final_grade)
    ");
    
    if ($stmt->execute([$enrollment_id, $cc1, $cc2, $final_exam, $final_grade])) {
        jsonResponse([
            "message" => "Notes mises à jour", 
            "final_grade" => $final_grade ? round($final_grade, 2) : null
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de la mise à jour des notes."]);
    }
}
?>