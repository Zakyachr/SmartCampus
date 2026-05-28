<?php
// Configuration MySQL/MariaDB (MAMP)
$dbHost = 'localhost';
$dbPort = 3306;
$dbName = 'smartcampus';
$dbUser = 'root';
$dbPass = 'root';

// Première connexion : sans la base de données (pour créer la base)
$dsn = "mysql:host=$dbHost;port=$dbPort;charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
    
    // Créer la base de données
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $dbName");
    
    // Sélectionner la base de données
    $pdo->exec("USE $dbName");
    
    echo "<h3>Création des tables MySQL...</h3>";

    // Table users
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Table teachers
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS teachers (
      id INT PRIMARY KEY,
      department VARCHAR(100),
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Table students
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS students (
      id INT PRIMARY KEY,
      student_number VARCHAR(50) NOT NULL UNIQUE,
      major VARCHAR(100),
      level VARCHAR(50),
      date_of_birth DATE,
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Table courses
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      teacher_id INT,
      max_capacity INT NOT NULL,
      status VARCHAR(50) DEFAULT 'ouvert',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Table enrollments
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS enrollments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      course_id INT NOT NULL,
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_student_course (student_id, course_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Table grades
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS grades (
      id INT AUTO_INCREMENT PRIMARY KEY,
      enrollment_id INT NOT NULL,
      cc1 DECIMAL(5,2),
      cc2 DECIMAL(5,2),
      final_exam DECIMAL(5,2),
      final_grade DECIMAL(5,2),
      FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Table schedules
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      day_of_week VARCHAR(50) NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      room VARCHAR(50) NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    echo "<p>✅ Tables MySQL créées avec succès.</p>";

    // Vérifier si les données existent
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    if ($stmt->fetchColumn() == 0) {
        $hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // mot de passe "password"
        
        // Insérer les utilisateurs
        $pdo->exec("INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES 
        (1, 'admin1@smartcampus.edu', '$hash', 'admin', 'Super', 'Admin'),
        (2, 'teacher1@smartcampus.edu', '$hash', 'teacher', 'Alan', 'Turing'),
        (3, 'teacher2@smartcampus.edu', '$hash', 'teacher', 'Ada', 'Lovelace'),
        (4, 'student1@smartcampus.edu', '$hash', 'student', 'Emma', 'Martin'),
        (5, 'student2@smartcampus.edu', '$hash', 'student', 'Lucas', 'Dubois');");

        // Insérer les professeurs
        $pdo->exec("INSERT INTO teachers (id, department) VALUES 
        (2, 'Informatique'),
        (3, 'Mathématiques');");

        // Insérer les étudiants
        $pdo->exec("INSERT INTO students (id, student_number, major, level, date_of_birth) VALUES 
        (4, 'E20260001', 'Génie Logiciel', 'ING2', '2004-03-15'),
        (5, 'E20260002', 'Systèmes Embarqués', 'ING2', '2004-07-22');");

        // Insérer les cours
        $pdo->exec("INSERT INTO courses (id, code, title, teacher_id, max_capacity, status) VALUES 
        (1, 'CS101', 'Algorithmique Avancée', 2, 30, 'ouvert'),
        (2, 'MATH201', 'Algèbre Linéaire', 3, 2, 'ouvert');");

        // Insérer les inscriptions
        $pdo->exec("INSERT INTO enrollments (id, student_id, course_id) VALUES 
        (1, 4, 1),
        (2, 5, 1),
        (3, 4, 2);");

        // Insérer les emplois du temps
        $pdo->exec("INSERT INTO schedules (id, course_id, day_of_week, start_time, end_time, room) VALUES 
        (1, 1, 'Lundi', '08:30:00', '10:00:00', 'Amphi A'),
        (2, 2, 'Mardi', '10:30:00', '12:00:00', 'Salle B12');");

        echo "<p>✅ Données de base (Seed) insérées avec succès ! L'application est prête.</p>";
    } else {
        echo "<p>ℹ️ Les données existent déjà. Rien n'a été ajouté.</p>";
    }

} catch (Exception $e) {
    echo "<p style='color:red;'>❌ Erreur : " . htmlspecialchars($e->getMessage()) . "</p>";
    die();
}
?>
