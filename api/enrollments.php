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

    // RÈGLE MÉTIER 2 : Détection des conflits d'emploi du temps
    $stmtSchedule = $pdo->prepare("
        SELECT s.day_of_week, s.start_time, s.end_time FROM schedules s
        WHERE s.course_id = ?
    ");
    $stmtSchedule->execute([$course_id]);
    $newCourseSchedule = $stmtSchedule->fetch();

    if ($newCourseSchedule) {
        // Récupérer tous les cours auxquels l'étudiant est inscrit
        $stmtConflict = $pdo->prepare("
            SELECT e.course_id, s.day_of_week, s.start_time, s.end_time, c.title
            FROM enrollments e
            JOIN schedules s ON e.course_id = s.course_id
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = ? AND s.day_of_week = ?
        ");
        $stmtConflict->execute([$student_id, $newCourseSchedule['day_of_week']]);
        $existingCourses = $stmtConflict->fetchAll();

        foreach ($existingCourses as $existing) {
            $newStart = strtotime($newCourseSchedule['start_time']);
            $newEnd = strtotime($newCourseSchedule['end_time']);
            $existStart = strtotime($existing['start_time']);
            $existEnd = strtotime($existing['end_time']);

            // Vérifier s'il y a chevauchement
            if ($newStart < $existEnd && $newEnd > $existStart) {
                http_response_code(400);
                echo json_encode([
                    "error" => "Conflit d'emploi du temps détecté. Vous avez déjà le cours '{$existing['title']}' à cette heure.",
                    "conflict_course" => $existing['title']
                ]);
                exit();
            }
        }
    }

    // RÈGLE MÉTIER 3 : Tentative d'inscription (la DB bloquera les doublons grâce au UNIQUE KEY)
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