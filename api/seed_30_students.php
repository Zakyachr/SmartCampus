<?php
require_once 'config/db.php';

// Set headers for JSON response or HTML display
header("Content-Type: text/html; charset=UTF-8");

echo "<h2>Génération et synchronisation de 30 étudiants</h2>";

try {
    // 1. Compter le nombre actuel d'étudiants
    $countStmt = $pdo->query("SELECT COUNT(*) FROM students");
    $currentCount = (int)$countStmt->fetchColumn();
    
    echo "<p>Nombre d'étudiants actuels dans la base de données : <strong>$currentCount</strong></p>";
    
    if ($currentCount >= 30) {
        echo "<p style='color: green;'>✅ Il y a déjà $currentCount étudiants (>= 30) dans la base de données. Aucune action requise.</p>";
        exit();
    }
    
    $studentsNeeded = 30 - $currentCount;
    echo "<p>Génération de <strong>$studentsNeeded</strong> nouveaux étudiants...</p>";
    
    // Hash par défaut pour le mot de passe "password"
    $hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    
    // Listes de données mockées
    $firstNames = [
        'Alice', 'Julien', 'Mathilde', 'Thomas', 'Sarah', 'Nicolas', 'Chloé', 'Hugo', 'Manon', 'Arthur',
        'Léa', 'Paul', 'Camille', 'Louis', 'Clara', 'Maxime', 'Inès', 'Alexandre', 'Zoé', 'Antoine',
        'Jules', 'Emma', 'Nathan', 'Jade', 'Léo', 'Lola', 'Enzo', 'Eva', 'Lucas', 'Mila'
    ];
    
    $lastNames = [
        'Dubois', 'Lefebvre', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Garcia', 'Thomas', 'Robert', 'Richard',
        'Petit', 'Durand', 'Leroy', 'Morel', 'Fournier', 'Dufour', 'Girard', 'Bonnet', 'Mercier', 'Rousseau',
        'Guerin', 'Boyer', 'Devaux', 'Chevalier', 'Fontaine', 'Barbier', 'Aubry', 'Guillot', 'Dupont', 'Muller'
    ];
    
    $majors = ['Génie Logiciel', 'Systèmes Embarqués', 'Finances', 'Informatique', 'Électronique'];
    $levels = ['ING1', 'ING2', 'ING3'];
    
    // Récupérer les cours existants pour inscrire les étudiants
    $coursesQuery = $pdo->query("SELECT id FROM courses");
    $courseIds = $coursesQuery->fetchAll(PDO::FETCH_COLUMN);
    
    $addedCount = 0;
    
    // Déterminer le prochain numéro étudiant séquentiel
    $studentNumbersQuery = $pdo->query("SELECT student_number FROM students WHERE student_number LIKE 'E2026%'");
    $existingNumbers = $studentNumbersQuery->fetchAll(PDO::FETCH_COLUMN);
    $maxSuffix = 0;
    foreach ($existingNumbers as $num) {
        $suffix = (int)substr($num, 5);
        if ($suffix > $maxSuffix) {
            $maxSuffix = $suffix;
        }
    }
    
    // Démarrer une transaction
    $pdo->beginTransaction();
    
    for ($i = 0; $i < $studentsNeeded; $i++) {
        // Sélection aléatoire d'un nom/prénom unique ou combiné
        $fn = $firstNames[array_rand($firstNames)];
        $ln = $lastNames[array_rand($lastNames)];
        
        // Nettoyer les accents pour l'email
        $cleanFn = str_replace(['é', 'è', 'à', 'ç', 'ù', 'â', 'ê', 'î', 'ô', 'û', 'ë', 'ï', 'ü', 'ÿ', ' '], ['e', 'e', 'a', 'c', 'u', 'a', 'e', 'i', 'o', 'u', 'e', 'i', 'u', 'y', ''], strtolower($fn));
        $cleanLn = str_replace(['é', 'è', 'à', 'ç', 'ù', 'â', 'ê', 'î', 'ô', 'û', 'ë', 'ï', 'ü', 'ÿ', ' '], ['e', 'e', 'a', 'c', 'u', 'a', 'e', 'i', 'o', 'u', 'e', 'i', 'u', 'y', ''], strtolower($ln));
        $emailBase = $cleanFn . '.' . $cleanLn;
        $emailBase = preg_replace('/[^a-z0-9\._-]/', '', $emailBase);
        $email = $emailBase . rand(100, 999) . '@smartcampus.edu';
        
        // Insérer dans la table users
        $userStmt = $pdo->prepare("INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (?, ?, 'student', ?, ?)");
        $userStmt->execute([$email, $hash, $fn, $ln]);
        $userId = $pdo->lastInsertId();
        
        // Générer un numéro étudiant unique séquentiel
        $maxSuffix++;
        $studentNumber = 'E2026' . str_pad((string)$maxSuffix, 4, '0', STR_PAD_LEFT);
        
        // Paramètres étudiants
        $major = $majors[array_rand($majors)];
        $level = $levels[array_rand($levels)];
        $dob = date('Y-m-d', strtotime('-' . rand(20, 24) . ' years -' . rand(0, 365) . ' days'));
        
        // Insérer dans la table students
        $studentStmt = $pdo->prepare("INSERT INTO students (id, student_number, major, level, date_of_birth) VALUES (?, ?, ?, ?, ?)");
        $studentStmt->execute([$userId, $studentNumber, $major, $level, $dob]);
        
        // Inscrire l'étudiant à 2 ou 3 cours aléatoires
        if (!empty($courseIds)) {
            $nbCoursesToEnroll = rand(2, 3);
            $selectedCourses = array_rand(array_flip($courseIds), min($nbCoursesToEnroll, count($courseIds)));
            if (!is_array($selectedCourses)) {
                $selectedCourses = [$selectedCourses];
            }
            
            foreach ($selectedCourses as $courseId) {
                // Inscription
                $enrollStmt = $pdo->prepare("INSERT IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)");
                $enrollStmt->execute([$userId, $courseId]);
                $enrollId = $pdo->lastInsertId();
                
                // Si l'inscription a réussi (pas de doublon), ajouter des notes mockées
                if ($enrollId > 0) {
                    $cc1 = rand(80, 200) / 10;
                    $cc2 = rand(80, 200) / 10;
                    $finalExam = rand(80, 200) / 10;
                    $finalGrade = round(($cc1 * 0.3) + ($cc2 * 0.3) + ($finalExam * 0.4), 2);
                    
                    $gradeStmt = $pdo->prepare("INSERT INTO grades (enrollment_id, cc1, cc2, final_exam, final_grade, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $gradeStmt->execute([$enrollId, $cc1, $cc2, $finalExam, $finalGrade, $fn, $ln]);
                }
            }
        }
        
        $addedCount++;
        echo "<li>Ajouté : <strong>$fn $ln</strong> ($email) - Major: $major, Level: $level</li>";
    }
    
    $pdo->commit();
    
    echo "<p style='color: green;'><strong>🎉 Succès ! $addedCount étudiants ont été générés et ajoutés avec succès avec leurs notes et inscriptions.</strong></p>";
    echo "<p>Le total est désormais de 30 étudiants dans la base de données.</p>";
    
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "<p style='color: red;'>❌ Erreur de génération des étudiants : " . $e->getMessage() . "</p>";
}
?>
