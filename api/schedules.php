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
?>