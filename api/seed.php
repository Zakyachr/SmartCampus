<?php
require_once 'config/db.php';
require_once 'middleware/auth_check.php';

// Seulement accessible en développement ou avec une clé secrète
$allowedIPs = ['127.0.0.1', 'localhost', '::1'];
$remoteIP = $_SERVER['REMOTE_ADDR'];

if (!in_array($remoteIP, $allowedIPs)) {
    http_response_code(403);
    echo json_encode(["error" => "Accès refusé"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $action = $_GET['action'] ?? '';

    if ($action === 'seed') {
        try {
            // Lire et exécuter le fichier SQL de seed
            $sqlFile = __DIR__ . '/../sql/seed_additional_data.sql';
            
            if (!file_exists($sqlFile)) {
                http_response_code(404);
                echo json_encode(["error" => "Fichier SQL non trouvé"]);
                exit();
            }

            $sql = file_get_contents($sqlFile);
            
            // Exécuter le script SQL ligne par ligne
            $statements = array_filter(array_map('trim', preg_split('/;/', $sql)));
            
            foreach ($statements as $statement) {
                if (!empty($statement)) {
                    // Remplacer USE par SELECT pour éviter les erreurs
                    if (stripos($statement, 'USE') === 0) {
                        continue;
                    }
                    $pdo->exec($statement);
                }
            }

            jsonResponse(["message" => "Données de seed importées avec succès !"], 200);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de l'import : " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Action inconnue"]);
    }
} elseif ($method === 'GET') {
    // Afficher les stats actuelles
    try {
        $stats = [];
        
        $counts = [
            'users' => 'SELECT COUNT(*) as count FROM users',
            'students' => 'SELECT COUNT(*) as count FROM students',
            'teachers' => 'SELECT COUNT(*) as count FROM teachers',
            'courses' => 'SELECT COUNT(*) as count FROM courses',
            'enrollments' => 'SELECT COUNT(*) as count FROM enrollments',
            'grades' => 'SELECT COUNT(*) as count FROM grades',
        ];

        foreach ($counts as $key => $query) {
            $result = $pdo->query($query)->fetch();
            $stats[$key] = $result['count'];
        }

        jsonResponse($stats, 200);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>
