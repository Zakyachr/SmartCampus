<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

// Tout le monde peut voir les cours, mais seul l'admin peut les modifier
requireRole(['admin', 'teacher', 'student']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Lister les cours avec le nom de l'enseignant
    $stmt = $pdo->query("
        SELECT c.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name 
        FROM courses c 
        LEFT JOIN users u ON c.teacher_id = u.id
    ");
    jsonResponse($stmt->fetchAll());
} 
elseif ($method === 'POST') {
    requireRole(['admin']); // Restreint à l'admin
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    $code = filter_var($data['code'] ?? '', FILTER_SANITIZE_STRING);
    $title = filter_var($data['title'] ?? '', FILTER_SANITIZE_STRING);
    $teacher_id = filter_var($data['teacher_id'] ?? null, FILTER_VALIDATE_INT);
    $max_capacity = filter_var($data['max_capacity'] ?? 30, FILTER_VALIDATE_INT);
    
    if (empty($code) || empty($title) || !$max_capacity) {
        http_response_code(400);
        echo json_encode(["error" => "Données invalides ou incomplètes."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO courses (code, title, teacher_id, max_capacity) VALUES (?, ?, ?, ?)");
        $stmt->execute([$code, $title, $teacher_id, $max_capacity]);
        jsonResponse(["message" => "Cours créé avec succès.", "id" => $pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            http_response_code(400);
            echo json_encode(["error" => "Ce code de cours existe déjà."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de la création du cours."]);
        }
    }
}
?>