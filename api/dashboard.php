<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

requireRole(['admin', 'teacher', 'student']);

$role = $_SESSION['role'];
$user_id = $_SESSION['user_id'];
$dashboard_data = [];

if ($role === 'student') {
    // Nombre de cours suivis
    $stmt = $pdo->prepare("SELECT COUNT(*) as total_courses FROM enrollments WHERE student_id = ?");
    $stmt->execute([$user_id]);
    $dashboard_data['total_courses'] = $stmt->fetchColumn();

    // Moyenne générale (approximation simple)
    $stmt = $pdo->prepare("SELECT AVG(final_grade) as gpa FROM grades g JOIN enrollments e ON g.enrollment_id = e.id WHERE e.student_id = ?");
    $stmt->execute([$user_id]);
    $dashboard_data['gpa'] = round($stmt->fetchColumn(), 2) ?? 'N/A';

} elseif ($role === 'teacher') {
    // Nombre de cours enseignés
    $stmt = $pdo->prepare("SELECT COUNT(*) as my_courses FROM courses WHERE teacher_id = ?");
    $stmt->execute([$user_id]);
    $dashboard_data['my_courses'] = $stmt->fetchColumn();

    // Nombre total d'étudiants dans ses cours
    $stmt = $pdo->prepare("SELECT COUNT(e.id) as total_students FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.teacher_id = ?");
    $stmt->execute([$user_id]);
    $dashboard_data['total_students'] = $stmt->fetchColumn();

} elseif ($role === 'admin') {
    // Stats globales
    $dashboard_data['total_students'] = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();
    $dashboard_data['total_teachers'] = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'teacher'")->fetchColumn();
    $dashboard_data['total_courses'] = $pdo->query("SELECT COUNT(*) FROM courses")->fetchColumn();
}

jsonResponse($dashboard_data);
?>