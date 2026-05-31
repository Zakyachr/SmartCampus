<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

requireRole(['teacher', 'admin', 'student']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Si étudiant : ne voit que ses notes
    if ($_SESSION['role'] === 'student') {
        $stmt = $pdo->prepare("
            SELECT g.*, e.course_id, e.id as enrollment_id, c.title as course_title, c.code as course_code, 
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
        $student_id = filter_var($_GET['student_id'] ?? null, FILTER_VALIDATE_INT);
        $course_id = filter_var($_GET['course_id'] ?? null, FILTER_VALIDATE_INT);
        
        if ($course_id) {
            $stmt = $pdo->prepare("
                SELECT e.id as enrollment_id, g.cc1, g.cc2, g.final_exam, g.final_grade, 
                       u.first_name, u.last_name, s.student_number,
                       c.title as course_title, c.code as course_code
                FROM enrollments e
                LEFT JOIN grades g ON g.enrollment_id = e.id
                JOIN users u ON e.student_id = u.id
                JOIN students s ON u.id = s.id
                JOIN courses c ON e.course_id = c.id
                WHERE c.teacher_id = ? AND c.id = ?
                ORDER BY u.last_name, u.first_name
            ");
            $stmt->execute([$teacher_id, $course_id]);
        } else {
            $stmt = $pdo->prepare("
                SELECT e.id as enrollment_id, g.cc1, g.cc2, g.final_exam, g.final_grade, 
                       u.first_name, u.last_name, s.student_number,
                       c.title as course_title, c.code as course_code
                FROM enrollments e
                LEFT JOIN grades g ON g.enrollment_id = e.id
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
        $student_id = filter_var($_GET['student_id'] ?? null, FILTER_VALIDATE_INT);
        
        if ($student_id) {
            $stmt = $pdo->prepare("
                SELECT g.*, e.id as enrollment_id, u.first_name, u.last_name, s.student_number,
                       c.title as course_title, c.code as course_code,
                       prof.first_name as teacher_first_name, prof.last_name as teacher_last_name
                FROM grades g
                JOIN enrollments e ON g.enrollment_id = e.id
                JOIN users u ON e.student_id = u.id
                JOIN students s ON u.id = s.id
                JOIN courses c ON e.course_id = c.id
                LEFT JOIN users prof ON c.teacher_id = prof.id
                WHERE u.id = ?
                ORDER BY c.title
            ");
            $stmt->execute([$student_id]);
        } else {
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
        }
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
    
    // Récupérer les pondérations (avec valeurs par défaut)
    $cc1_weight = isset($data['cc1_weight']) ? filter_var($data['cc1_weight'], FILTER_VALIDATE_FLOAT) : 30;
    $cc2_weight = isset($data['cc2_weight']) ? filter_var($data['cc2_weight'], FILTER_VALIDATE_FLOAT) : 30;
    $exam_weight = isset($data['exam_weight']) ? filter_var($data['exam_weight'], FILTER_VALIDATE_FLOAT) : 40;
    
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

    // Calcul de la moyenne utilisant les pondérations envoyées par le frontend
    $final_grade = null;
    if ($cc1 !== null && $cc2 !== null && $final_exam !== null) {
        // Normaliser les poids à 100 pour le calcul
        $total_weight = $cc1_weight + $cc2_weight + $exam_weight;
        if ($total_weight > 0) {
            $final_grade = ($cc1 * $cc1_weight + $cc2 * $cc2_weight + $final_exam * $exam_weight) / $total_weight;
        }
    }

    // Vérifier que le cours n'est pas verrouillé ("validé")
    $stmtCheckStatus = $pdo->prepare("
        SELECT c.status FROM courses c 
        JOIN enrollments e ON c.id = e.course_id 
        WHERE e.id = ?
    ");
    $stmtCheckStatus->execute([$enrollment_id]);
    $courseStatus = $stmtCheckStatus->fetchColumn();

    if ($courseStatus === 'validé' && $_SESSION['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Les notes de ce cours sont verrouillées après validation finale."]);
        exit();
    }

    // Récupérer le nom et prénom de l'étudiant
    $stmtStudent = $pdo->prepare("
        SELECT u.first_name, u.last_name 
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        WHERE e.id = ?
    ");
    $stmtStudent->execute([$enrollment_id]);
    $student = $stmtStudent->fetch();
    $first_name = $student['first_name'] ?? null;
    $last_name = $student['last_name'] ?? null;

    // Mise à jour de la note
    // D'abord, vérifier si une note existe déjà
    $stmtCheck = $pdo->prepare("SELECT id FROM grades WHERE enrollment_id = ?");
    $stmtCheck->execute([$enrollment_id]);
    $gradeId = $stmtCheck->fetchColumn();

    if ($gradeId) {
        // Mettre à jour la note existante
        $stmt = $pdo->prepare("
            UPDATE grades 
            SET cc1 = ?, cc2 = ?, final_exam = ?, final_grade = ?, first_name = ?, last_name = ?
            WHERE enrollment_id = ?
        ");
        $success = $stmt->execute([$cc1, $cc2, $final_exam, $final_grade, $first_name, $last_name, $enrollment_id]);
    } else {
        // Créer une nouvelle note
        $stmt = $pdo->prepare("
            INSERT INTO grades (enrollment_id, cc1, cc2, final_exam, final_grade, first_name, last_name) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $success = $stmt->execute([$enrollment_id, $cc1, $cc2, $final_exam, $final_grade, $first_name, $last_name]);
    }
    
    if ($success) {
        jsonResponse([
            "message" => "Notes mises à jour avec succès", 
            "final_grade" => $final_grade ? round($final_grade, 2) : null
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de la mise à jour des notes."]);
    }
}
?>