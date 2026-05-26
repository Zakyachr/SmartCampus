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

// Configuration BDD - SPÉCIALE MAMP
$host = '127.0.0.1';
$port = '3306'; // Port par défaut de MySQL sur Windows         // Port MySQL par défaut de MAMP
$db   = 'smartcampus_db';
$user = 'root';         // Utilisateur par défaut de MAMP
$pass = 'root';         // Mot de passe par défaut de MAMP
$charset = 'utf8mb4';

// Le DSN (Data Source Name) inclut maintenant le port 8889
$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Affiche les erreurs SQL proprement
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Retourne les données sous forme de tableau associatif
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Sécurité absolue contre les injections SQL
];

try {
    // Tentative de connexion à la base de données
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Si la connexion échoue (ex: MAMP n'est pas lancé), on renvoie une erreur JSON claire
    http_response_code(500);
    echo json_encode(["error" => "Erreur de connexion à la base de données. Vérifiez que MySQL est lancé sur MAMP."]);
    exit();
}
?>