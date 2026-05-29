<?php
$dbFile = __DIR__ . '/config/database.sqlite';

try {
    // Création ou ouverture du fichier SQLite
    $pdo = new PDO("sqlite:" . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Activer les clés étrangères sur SQLite
    $pdo->exec("PRAGMA foreign_keys = ON;");

    echo "<h3>Création des tables...</h3>";

    // Table users
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );");

    // Table teachers
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY,
      department TEXT,
      FOREIGN KEY (id) REFERENCES users(id)
    );");

    // Table students
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY,
      student_number TEXT NOT NULL,
      major TEXT,
      level TEXT,
      date_of_birth DATE,
      FOREIGN KEY (id) REFERENCES users(id)
    );");

    // Table courses
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      teacher_id INTEGER,
      max_capacity INTEGER NOT NULL,
      status TEXT DEFAULT 'ouvert',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );");

    // Table enrollments
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, course_id),
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );");

    // Table grades
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enrollment_id INTEGER NOT NULL,
      cc1 REAL,
      cc2 REAL,
      final_exam REAL,
      final_grade REAL,
      FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
    );");

    // Table schedules
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      day_of_week TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );");

    echo "<p>✅ Tables créées avec succès.</p>";

    // Insertion des données de base (si la table users est vide)
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    if ($stmt->fetchColumn() == 0) {
        $hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // mot de passe "password"
        
        // Users
        $pdo->exec("INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES 
        (1, 'admin1@smartcampus.edu', '$hash', 'admin', 'Super', 'Admin'),
        (2, 'teacher1@smartcampus.edu', '$hash', 'teacher', 'Alan', 'Turing'),
        (3, 'teacher2@smartcampus.edu', '$hash', 'teacher', 'Ada', 'Lovelace'),
        (4, 'student1@smartcampus.edu', '$hash', 'student', 'Emma', 'Martin'),
        (5, 'student2@smartcampus.edu', '$hash', 'student', 'Lucas', 'Dubois')");

        // Teachers
        $pdo->exec("INSERT INTO teachers (id, department) VALUES 
        (2, 'Informatique'),
        (3, 'Mathématiques')");

        // Students
        $pdo->exec("INSERT INTO students (id, student_number, major, level, date_of_birth) VALUES 
        (4, 'E20260001', 'Génie Logiciel', 'ING2', '2004-03-15'),
        (5, 'E20260002', 'Systèmes Embarqués', 'ING2', '2004-07-22')");

        // Courses
        $pdo->exec("INSERT INTO courses (id, code, title, teacher_id, max_capacity, status) VALUES 
        (1, 'CS101', 'Algorithmique Avancée', 2, 30, 'ouvert'),
        (2, 'MATH201', 'Algèbre Linéaire', 3, 2, 'ouvert')");

        // Enrollments
        $pdo->exec("INSERT INTO enrollments (id, student_id, course_id) VALUES 
        (1, 4, 1),
        (2, 5, 1),
        (3, 4, 2)");

        // Schedules
        $pdo->exec("INSERT INTO schedules (id, course_id, day_of_week, start_time, end_time, room) VALUES 
        (1, 1, 'Lundi', '08:30:00', '10:00:00', 'Amphi A'),
        (2, 2, 'Mardi', '10:30:00', '12:00:00', 'Salle B12')");

        echo "<p>✅ Données de base (Seed) insérées avec succès ! L'application est prête.</p>";
    } else {
         echo "<p>Les données existent déjà. Rien n'a été ajouté.</p>";
    }

} catch (Exception $e) {
    echo "<p style='color:red;'>Erreur : " . $e->getMessage() . "</p>";
}
?>