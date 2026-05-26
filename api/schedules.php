<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

requireRole(['admin', 'teacher', 'student']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $role = $_SESSION['role'];
    $user_id = $_SESSION['user_id'];

    if ($role === 'student') {
        // L'étudiant ne voit que l'emploi du temps des cours auxquels il est inscrit
        $stmt = $pdo->prepare("
            SELECT s.*, c.title as course_title, c.code, u.last_name as teacher_name 
            FROM schedules s
            JOIN courses c ON s.course_id = c.id
            JOIN enrollments e ON c.id = e.course_id
            JOIN users u ON c.teacher_id = u.id
            WHERE e.student_id = ?
            ORDER BY FIELD(s.day_of_week, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'), s.start_time
        ");
        $stmt->execute([$user_id]);
    } elseif ($role === 'teacher') {
        // L'enseignant ne voit que l'emploi du temps des cours qu'il donne
        $stmt = $pdo->prepare("
            SELECT s.*, c.title as course_title, c.code 
            FROM schedules s
            JOIN courses c ON s.course_id = c.id
            WHERE c.teacher_id = ?
            ORDER BY FIELD(s.day_of_week, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'), s.start_time
        ");
        $stmt->execute([$user_id]);
    } else {
        // L'admin voit tout
        $stmt = $pdo->prepare("
            SELECT s.*, c.title as course_title, c.code, u.last_name as teacher_name 
            FROM schedules s
            JOIN courses c ON s.course_id = c.id
            JOIN users u ON c.teacher_id = u.id
            ORDER BY FIELD(s.day_of_week, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'), s.start_time
        ");
        $stmt->execute();
    }
    
    jsonResponse($stmt->fetchAll());
}
elseif ($method === 'POST') {
    requireRole(['admin']); // Seul l'admin peut modifier l'emploi du temps globalement
    
    $data = json_decode(file_get_contents("php://input"), true);
    $course_id = filter_var($data['course_id'] ?? null, FILTER_VALIDATE_INT);
    $day_of_week = filter_var($data['day_of_week'] ?? '', FILTER_SANITIZE_STRING);
    $start_time = filter_var($data['start_time'] ?? '', FILTER_SANITIZE_STRING);
    $end_time = filter_var($data['end_time'] ?? '', FILTER_SANITIZE_STRING);
    $room = filter_var($data['room'] ?? '', FILTER_SANITIZE_STRING);

    if (!$course_id || empty($day_of_week) || empty($start_time) || empty($end_time) || empty($room)) {
        http_response_code(400);
        echo json_encode(["error" => "Données invalides ou incomplètes."]);
        exit();
    }

    if (strtotime($start_time) >= strtotime($end_time)) {
        http_response_code(400);
        echo json_encode(["error" => "L'heure de fin doit être après l'heure de début."]);
        exit();
    }

    // Vérifier si le cours existe et récupérer son prof
    $stmtCourse = $pdo->prepare("SELECT teacher_id FROM courses WHERE id = ?");
    $stmtCourse->execute([$course_id]);
    $teacher_id = $stmtCourse->fetchColumn();

    if (!$teacher_id) {
        http_response_code(404);
        echo json_encode(["error" => "Cours introuvable ou n'a pas de professeur assigné."]);
        exit();
    }

    // Détection des conflits (Salle ou Professeur)
    $stmtConflict = $pdo->prepare("
        SELECT c.title, s.room, u.last_name as teacher_name
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        JOIN users u ON c.teacher_id = u.id
        WHERE s.day_of_week = ?
        AND (? < s.end_time AND ? > s.start_time)
        AND (s.room = ? OR c.teacher_id = ?)
    ");
    $stmtConflict->execute([$day_of_week, $start_time, $end_time, $room, $teacher_id]);
    $conflict = $stmtConflict->fetch();

    if ($conflict) {
        http_response_code(400);
        if ($conflict['room'] === $room) {
            echo json_encode(["error" => "Conflit de salle : La salle {$room} est déjà occupée par '{$conflict['title']}'."]);
        } else {
            echo json_encode(["error" => "Conflit de professeur : Prof. {$conflict['teacher_name']} donne déjà '{$conflict['title']}' à ce moment."]);
        }
        exit();
    }

    // Vérifier si un horaire existe déjà pour ce cours (pour simplifier, 1 seul horaire par cours)
    $stmtExist = $pdo->prepare("SELECT id FROM schedules WHERE course_id = ?");
    $stmtExist->execute([$course_id]);
    if ($stmtExist->fetch()) {
        http_response_code(400);
        echo json_encode(["error" => "Ce cours a déjà un horaire. Veuillez le modifier plutôt que d'en ajouter un nouveau."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO schedules (course_id, day_of_week, start_time, end_time, room) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$course_id, $day_of_week, $start_time, $end_time, $room]);
        jsonResponse(["message" => "Horaire ajouté avec succès.", "id" => $pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de l'ajout de l'horaire."]);
    }
}
elseif ($method === 'PUT') {
    requireRole(['admin']);
    
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    $data = json_decode(file_get_contents("php://input"), true);
    
    $day_of_week = filter_var($data['day_of_week'] ?? '', FILTER_SANITIZE_STRING);
    $start_time = filter_var($data['start_time'] ?? '', FILTER_SANITIZE_STRING);
    $end_time = filter_var($data['end_time'] ?? '', FILTER_SANITIZE_STRING);
    $room = filter_var($data['room'] ?? '', FILTER_SANITIZE_STRING);

    if (!$id || empty($day_of_week) || empty($start_time) || empty($end_time) || empty($room)) {
        http_response_code(400);
        echo json_encode(["error" => "Données invalides ou incomplètes."]);
        exit();
    }

    if (strtotime($start_time) >= strtotime($end_time)) {
        http_response_code(400);
        echo json_encode(["error" => "L'heure de fin doit être après l'heure de début."]);
        exit();
    }

    // Récupérer le teacher_id pour ce schedule
    $stmtTeacher = $pdo->prepare("
        SELECT c.teacher_id FROM schedules s 
        JOIN courses c ON s.course_id = c.id 
        WHERE s.id = ?
    ");
    $stmtTeacher->execute([$id]);
    $teacher_id = $stmtTeacher->fetchColumn();

    // Détection des conflits (Salle ou Professeur) en ignorant cet horaire spécifique
    $stmtConflict = $pdo->prepare("
        SELECT c.title, s.room, u.last_name as teacher_name
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        JOIN users u ON c.teacher_id = u.id
        WHERE s.day_of_week = ?
        AND (? < s.end_time AND ? > s.start_time)
        AND (s.room = ? OR c.teacher_id = ?)
        AND s.id != ?
    ");
    $stmtConflict->execute([$day_of_week, $start_time, $end_time, $room, $teacher_id, $id]);
    $conflict = $stmtConflict->fetch();

    if ($conflict) {
        http_response_code(400);
        if ($conflict['room'] === $room) {
            echo json_encode(["error" => "Conflit de salle : La salle {$room} est déjà occupée par '{$conflict['title']}'."]);
        } else {
            echo json_encode(["error" => "Conflit de professeur : Prof. {$conflict['teacher_name']} donne déjà '{$conflict['title']}' à ce moment."]);
        }
        exit();
    }

    try {
        $stmt = $pdo->prepare("UPDATE schedules SET day_of_week = ?, start_time = ?, end_time = ?, room = ? WHERE id = ?");
        $stmt->execute([$day_of_week, $start_time, $end_time, $room, $id]);
        jsonResponse(["message" => "Horaire modifié avec succès."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de la modification de l'horaire."]);
    }
}
elseif ($method === 'DELETE') {
    requireRole(['admin']);
    
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID de l'horaire manquant."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM schedules WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(["message" => "Horaire supprimé avec succès."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de la suppression de l'horaire."]);
    }
}
?>