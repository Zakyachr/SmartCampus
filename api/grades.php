<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

requireRole(['teacher', 'admin', 'student']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Si étudiant : ne voit que ses notes
    if ($_SESSION['role'] === 'student') {
        $stmt = $pdo->prepare("
            SELECT g.*, c.title as course_title, c.code as course_code 
            FROM grades g
            JOIN enrollments e ON g.enrollment_id = e.id
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = ?
        ");
        $stmt->execute([$_SESSION['user_id']]);
        jsonResponse($stmt->fetchAll());
    } 
    // Si enseignant : voit les notes de ses cours
    elseif ($_SESSION['role'] === 'teacher') {
        $stmt = $pdo->prepare("
            SELECT g.*, u.first_name, u.last_name, c.title as course_title 
            FROM grades g
            JOIN enrollments e ON g.enrollment_id = e.id
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
            WHERE c.teacher_id = ?
        ");
        $stmt->execute([$_SESSION['user_id']]);
        jsonResponse($stmt->fetchAll());
    }
} 
elseif ($method === 'PUT') {
    requireRole(['teacher']); // Seul le prof peut noter
    
    $data = json_decode(file_get_contents("php://input"), true);
    $enrollment_id = filter_var($data['enrollment_id'] ?? null, FILTER_VALIDATE_INT);
    $cc1 = filter_var($data['cc1'] ?? null, FILTER_VALIDATE_FLOAT);
    $cc2 = filter_var($data['cc2'] ?? null, FILTER_VALIDATE_FLOAT);
    $final_exam = filter_var($data['final_exam'] ?? null, FILTER_VALIDATE_FLOAT);
    
    // Calcul de la moyenne (30% CC1, 30% CC2, 40% Examen)
    $final_grade = ($cc1 * 0.3) + ($cc2 * 0.3) + ($final_exam * 0.4);

    // RÈGLE MÉTIER : Vérifier que le cours n'est pas verrouillé ("validé")
    $stmtCheck = $pdo->prepare("
        SELECT c.status FROM courses c 
        JOIN enrollments e ON c.id = e.course_id 
        WHERE e.id = ?
    ");
    $stmtCheck->execute([$enrollment_id]);
    $courseStatus = $stmtCheck->fetchColumn();

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
        jsonResponse(["message" => "Notes mises à jour", "final_grade" => round($final_grade, 2)]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de la mise à jour des notes."]);
    }
}
?>