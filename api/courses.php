<?php
// Inclure la configuration de la base de données et le middleware d'authentification
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

// Vérifier que l'utilisateur a un rôle autorisé
requireRole(['admin', 'teacher', 'student']);

$method = $_SERVER['REQUEST_METHOD'];

// GET : Récupérer la liste de tous les cours
if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT c.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name 
        FROM courses c 
        LEFT JOIN users u ON c.teacher_id = u.id
    ");
    jsonResponse($stmt->fetchAll());
} 
// POST : Créer un nouveau cours (admin uniquement)
elseif ($method === 'POST') {
    requireRole(['admin']);
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Valider et nettoyer les données
    $code = filter_var($data['code'] ?? '', FILTER_SANITIZE_STRING);
    $title = filter_var($data['title'] ?? '', FILTER_SANITIZE_STRING);
    $teacher_id = !empty($data['teacher_id']) ? filter_var($data['teacher_id'], FILTER_VALIDATE_INT) : null;
    $max_capacity = filter_var($data['max_capacity'] ?? 30, FILTER_VALIDATE_INT);
    
    if (empty($code) || empty($title) || !$max_capacity) {
        http_response_code(400);
        echo json_encode(["error" => "Données invalides ou incomplètes."]);
        exit();
    }

    try {
        // Insérer le nouveau cours dans la base de données
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
// DELETE : Supprimer un cours (admin uniquement)
elseif ($method === 'DELETE') {
    requireRole(['admin']);
    
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID du cours manquant ou invalide."]);
        exit();
    }

    try {
        // Supprimer le cours de la base de données
        $stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
        $stmt->execute([$id]);

        // Vérifier si le cours existait
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Cours introuvable."]);
            exit();
        }

        jsonResponse(["message" => "Cours supprimé avec succès."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de la suppression du cours."]);
    }
}
// PUT : Modifier un cours existant (admin uniquement)
elseif ($method === 'PUT') {
    requireRole(['admin']);
    
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Valider et nettoyer les données
    $code = filter_var($data['code'] ?? '', FILTER_SANITIZE_STRING);
    $title = filter_var($data['title'] ?? '', FILTER_SANITIZE_STRING);
    $teacher_id = !empty($data['teacher_id']) ? filter_var($data['teacher_id'], FILTER_VALIDATE_INT) : null;
    $max_capacity = filter_var($data['max_capacity'] ?? 30, FILTER_VALIDATE_INT);
    
    if (!$id || empty($code) || empty($title) || !$max_capacity) {
        http_response_code(400);
        echo json_encode(["error" => "Données invalides ou incomplètes."]);
        exit();
    }

    try {
        // Mettre à jour le cours dans la base de données
        $stmt = $pdo->prepare("UPDATE courses SET code = ?, title = ?, teacher_id = ?, max_capacity = ? WHERE id = ?");
        $stmt->execute([$code, $title, $teacher_id, $max_capacity, $id]);
        
        jsonResponse(["message" => "Cours modifié avec succès."]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            http_response_code(400);
            echo json_encode(["error" => "Ce code de cours existe déjà."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de la modification du cours."]);
        }
    }
}
// PATCH : Valider un cours et verrouiller les notes (admin/professeur)
elseif ($method === 'PATCH') {
    requireRole(['admin', 'teacher']);
    
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Vérifier les paramètres requis
    if (!$id || !isset($data['action']) || $data['action'] !== 'validate') {
        http_response_code(400);
        echo json_encode(["error" => "Requête invalide."]);
        exit();
    }

    // Vérifier que le professeur valide uniquement ses propres cours
    if ($_SESSION['role'] === 'teacher') {
        $stmtCheck = $pdo->prepare("SELECT teacher_id FROM courses WHERE id = ?");
        $stmtCheck->execute([$id]);
        if ($stmtCheck->fetchColumn() !== $_SESSION['user_id']) {
            http_response_code(403);
            echo json_encode(["error" => "Vous ne pouvez valider que vos propres cours."]);
            exit();
        }
    }

    try {
        // Marquer le cours comme validé
        $stmt = $pdo->prepare("UPDATE courses SET status = 'validé' WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(["message" => "Le cours a été validé. Les notes sont verrouillées."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de la validation du cours."]);
    }
}
?>