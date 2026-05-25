<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

requireRole(['student', 'admin']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Si c'est un étudiant, on force son ID. Si c'est un admin, il peut inscrire qui il veut.
    $student_id = ($_SESSION['role'] === 'student') ? $_SESSION['user_id'] : filter_var($data['student_id'] ?? null, FILTER_VALIDATE_INT);
    $course_id = filter_var($data['course_id'] ?? null, FILTER_VALIDATE_INT);

    if (!$student_id || !$course_id) {
        http_response_code(400);
        echo json_encode(["error" => "ID étudiant ou cours manquant."]);
        exit();
    }

    // RÈGLE MÉTIER 1 : Vérification de la capacité maximale du cours
    $stmt = $pdo->prepare("
        SELECT max_capacity, 
        (SELECT COUNT(*) FROM enrollments WHERE course_id = ?) as current_enrollments 
        FROM courses WHERE id = ?
    ");
    $stmt->execute([$course_id, $course_id]);
    $course = $stmt->fetch();

    if (!$course) {
        http_response_code(404);
        echo json_encode(["error" => "Cours introuvable."]);
        exit();
    }

    if ($course['current_enrollments'] >= $course['max_capacity']) {
        http_response_code(400);
        echo json_encode(["error" => "Capacité maximale atteinte pour ce cours. Inscription impossible."]);
        exit();
    }

    // RÈGLE MÉTIER 2 : Tentative d'inscription (la DB bloquera les doublons grâce au UNIQUE KEY)
    try {
        $stmt = $pdo->prepare("INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)");
        $stmt->execute([$student_id, $course_id]);
        jsonResponse(["message" => "Inscription réussie."], 201);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Code erreur MySQL pour violation de contrainte d'unicité
            http_response_code(400);
            echo json_encode(["error" => "Vous êtes déjà inscrit à ce cours."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Erreur serveur lors de l'inscription."]);
        }
    }
}
?>