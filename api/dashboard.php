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
    // Stats de base
    $dashboard_data['total_students'] = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();
    $dashboard_data['total_teachers'] = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'teacher'")->fetchColumn();
    $dashboard_data['total_courses'] = $pdo->query("SELECT COUNT(*) FROM courses")->fetchColumn();
    $dashboard_data['total_enrollments'] = $pdo->query("SELECT COUNT(*) FROM enrollments")->fetchColumn();

    // Moyenne générale globale
    $avg = $pdo->query("SELECT AVG(final_grade) FROM grades WHERE final_grade IS NOT NULL")->fetchColumn();
    $dashboard_data['global_average'] = $avg ? round($avg, 2) : 0;

    // Taux de réussite (note >= 10)
    $total_graded = $pdo->query("SELECT COUNT(*) FROM grades WHERE final_grade IS NOT NULL")->fetchColumn();
    $total_passed = $pdo->query("SELECT COUNT(*) FROM grades WHERE final_grade >= 10")->fetchColumn();
    $dashboard_data['pass_rate'] = $total_graded > 0 ? round(($total_passed / $total_graded) * 100, 1) : 0;

    // Répartition des étudiants par filière
    $stmt = $pdo->query("SELECT s.major, COUNT(*) as count FROM students s GROUP BY s.major ORDER BY count DESC");
    $dashboard_data['students_by_major'] = $stmt->fetchAll();

    // Top 5 cours par nombre d'inscrits
    $stmt = $pdo->query("
        SELECT c.id, c.code, c.title, COUNT(e.id) as enrollment_count, c.max_capacity,
               u.first_name as teacher_first_name, u.last_name as teacher_last_name
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN users u ON c.teacher_id = u.id
        GROUP BY c.id
        ORDER BY enrollment_count DESC
        LIMIT 5
    ");
    $dashboard_data['top_courses'] = $stmt->fetchAll();

    // Dernières inscriptions (5 dernières)
    $stmt = $pdo->query("
        SELECT u.first_name, u.last_name, c.title as course_title, e.enrolled_at
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enrolled_at DESC
        LIMIT 5
    ");
    $dashboard_data['recent_enrollments'] = $stmt->fetchAll();

    // Répartition par niveau
    $stmt = $pdo->query("SELECT s.level, COUNT(*) as count FROM students s GROUP BY s.level ORDER BY s.level");
    $dashboard_data['students_by_level'] = $stmt->fetchAll();
}

jsonResponse($dashboard_data);
?>