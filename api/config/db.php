<?php
// Configuration stricte de sécurité et CORS pour communiquer avec React (Vite)
header("Access-Control-Allow-Origin: http://localhost:5173"); 
if (strpos($_SERVER['HTTP_ORIGIN'] ?? '', 'localhost') !== false) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
} 
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Gestion du "preflight request" d'Axios (nécessaire pour les requêtes complexes en React)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration BDD - C'est maintenant une base de données sous forme de fichier
// Cela permet de n'avoir qu'un fichier "database.sqlite" qui se mettra à jour automatiquement !
// Plus besoin de configurer MySQL ou de lancer le serveur MySQL de MAMP

$dbFile = __DIR__ . '/database.sqlite';
// Le DSN (Data Source Name) utilise le driver SQLite
$dsn = "sqlite:" . $dbFile;

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Affiche les erreurs SQL proprement
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Retourne les données sous forme de tableau associatif
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Sécurité absolue contre les injections SQL
];

try {
    // Tentative de connexion (Puisque c'est SQLite, le fichier sera accédé directement via PHP)
    $pdo = new PDO($dsn, null, null, $options);
    
    // Activer les clés étrangères pour SQLite
    $pdo->exec("PRAGMA foreign_keys = ON;");
    
} catch (\PDOException $e) {
    // Si la connexion échoue
    http_response_code(500);
    echo json_encode(["error" => "Erreur de connexion à la base de données SQLite : " . $e->getMessage()]);
    exit();
}
?>