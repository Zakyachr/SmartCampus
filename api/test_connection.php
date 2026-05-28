<?php
// Test de connexion à la base de données
require_once 'config/db.php';

echo "<h2>Test de connexion à la base de données</h2>";

try {
    // Test 1: Connexion établie
    echo "<p style='color:green;'>✅ Connexion à MySQL établie avec succès</p>";
    
    // Test 2: Vérifier la base de données
    $result = $pdo->query("SELECT DATABASE() as db_name");
    $db = $result->fetch();
    echo "<p>Base de données active : <strong>" . $db['db_name'] . "</strong></p>";
    
    // Test 3: Lister les tables
    $result = $pdo->query("SHOW TABLES");
    $tables = $result->fetchAll();
    echo "<p>Tables trouvées :</p><ul>";
    foreach ($tables as $table) {
        $table_name = array_values($table)[0];
        echo "<li>" . $table_name . "</li>";
    }
    echo "</ul>";
    
    // Test 4: Vérifier les utilisateurs
    $result = $pdo->query("SELECT COUNT(*) as count FROM users");
    $count = $result->fetch();
    echo "<p>Nombre d'utilisateurs : <strong>" . $count['count'] . "</strong></p>";
    
    if ($count['count'] > 0) {
        $result = $pdo->query("SELECT id, email, role FROM users");
        echo "<p>Liste des utilisateurs :</p><ul>";
        foreach ($result->fetchAll() as $user) {
            echo "<li>" . $user['email'] . " (" . $user['role'] . ")</li>";
        }
        echo "</ul>";
    } else {
        echo "<p style='color:orange;'>⚠️ Aucun utilisateur trouvé. Vous devez insérer les données de base.</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red;'>❌ Erreur : " . $e->getMessage() . "</p>";
}
?>
