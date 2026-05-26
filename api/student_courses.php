<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

requireRole(['student']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $student_id = $_SESSION['user_id'];

    // 1. Récupérer les cours de l'étudiant avec ses notes
    $stmt = $pdo->prepare("
        SELECT 
            c.id as course_id,
            c.code,
            c.title,
            c.status,
            u.first_name as teacher_first_name,
            u.last_name as teacher_last_name,
            g.cc1,
            g.cc2,
            g.final_exam,
            g.final_grade,
            e.id as enrollment_id
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON c.teacher_id = u.id
        LEFT JOIN grades g ON g.enrollment_id = e.id
        WHERE e.student_id = ?
        ORDER BY c.title
    ");
    $stmt->execute([$student_id]);
    $studentCourses = $stmt->fetchAll();

    $result = [];

    foreach ($studentCourses as $course) {
        $course_id = $course['course_id'];

        // 2. Calculer la moyenne de classe pour ce cours
        $stmtClassAvg = $pdo->prepare("
            SELECT AVG(g.final_grade) as class_average, COUNT(g.id) as total_students
            FROM grades g
            JOIN enrollments e ON g.enrollment_id = e.id
            WHERE e.course_id = ? AND g.final_grade IS NOT NULL
        ");
        $stmtClassAvg->execute([$course_id]);
        $classData = $stmtClassAvg->fetch();

        // 3. Calculer le rang de l'étudiant dans ce cours
        $rank = null;
        $total_in_course = 0;
        if ($course['final_grade'] !== null) {
            // Compter combien d'étudiants ont une moyenne strictement supérieure
            $stmtRank = $pdo->prepare("
                SELECT COUNT(*) as better_count
                FROM grades g
                JOIN enrollments e ON g.enrollment_id = e.id
                WHERE e.course_id = ? AND g.final_grade IS NOT NULL AND g.final_grade > ?
            ");
            $stmtRank->execute([$course_id, $course['final_grade']]);
            $rankData = $stmtRank->fetch();
            $rank = $rankData['better_count'] + 1;
            $total_in_course = (int)$classData['total_students'];
        }

        $result[] = [
            'course_id' => $course['course_id'],
            'code' => $course['code'],
            'title' => $course['title'],
            'status' => $course['status'],
            'teacher_first_name' => $course['teacher_first_name'],
            'teacher_last_name' => $course['teacher_last_name'],
            'cc1' => $course['cc1'],
            'cc2' => $course['cc2'],
            'final_exam' => $course['final_exam'],
            'student_average' => $course['final_grade'] !== null ? round((float)$course['final_grade'], 2) : null,
            'class_average' => $classData['class_average'] !== null ? round((float)$classData['class_average'], 2) : null,
            'rank' => $rank,
            'total_students' => $total_in_course,
        ];
    }

    jsonResponse($result);
}
?>
