-- ========================================
-- Base de données SmartCampus complète
-- Création et initialisation
-- ========================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS smartcampus_db;
USE smartcampus_db;

-- ========================================
-- Table: users
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','teacher','admin') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: teachers
-- ========================================
CREATE TABLE IF NOT EXISTS teachers (
  id INT PRIMARY KEY,
  department VARCHAR(100),
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: students
-- ========================================
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY,
  student_number VARCHAR(50) NOT NULL UNIQUE,
  major VARCHAR(100),
  level VARCHAR(50),
  date_of_birth DATE,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: courses
-- ========================================
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  teacher_id INT,
  max_capacity INT NOT NULL,
  status ENUM('ouvert','fermé','validé') DEFAULT 'ouvert',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: enrollments
-- ========================================
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_course (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: grades
-- ========================================
CREATE TABLE IF NOT EXISTS grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL UNIQUE,
  cc1 DECIMAL(5,2),
  cc2 DECIMAL(5,2),
  final_exam DECIMAL(5,2),
  final_grade DECIMAL(5,2),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  KEY idx_grades_student_names (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: schedules
-- ========================================
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  day_of_week ENUM('Lundi','Mardi','Mercredi','Jeudi','Vendredi') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(50) NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Insertion des données : USERS
-- ========================================
INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
(1, 'admin1@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Super', 'Admin'),
(2, 'teacher1@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Alan', 'Turing'),
(3, 'teacher2@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Ada', 'Lovelace'),
(4, 'student1@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Emma', 'Martin'),
(5, 'student2@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Lucas', 'Dubois'),
(6, 'teacher3@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Marie', 'Curie'),
(7, 'teacher4@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Albert', 'Einstein'),
(8, 'teacher5@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Richard', 'Feynman'),
(9, 'student3@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Sophie', 'Bernard'),
(10, 'student4@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Antoine', 'Laurent'),
(11, 'student5@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Julien', 'Moreau'),
(12, 'student6@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Claire', 'Petit'),
(13, 'student7@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Pierre', 'Rousseau'),
(14, 'student8@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Anne', 'Michel'),
(15, 'student9@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Luc', 'Lefevre'),
(16, 'student10@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Marie', 'Dupont'),
(17, 'student11@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Victor', 'Girard'),
(18, 'student12@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Isabelle', 'Robert'),
(19, 'student13@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Thomas', 'Fournier'),
(20, 'student14@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Nathalie', 'Leclerc'),
(21, 'student15@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'David', 'Fontaine'),
(22, 'teacher6@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Nikola', 'Tesla'),
(23, 'teacher7@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Grace', 'Hopper'),
(24, 'teacher8@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Carl', 'Gauss'),
(25, 'davinlebg.h@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Davin', 'HANNA'),
(26, 'ilias.mazouz@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Ilias', 'MAZOUZ');

-- ========================================
-- Insertion des données : TEACHERS
-- ========================================
INSERT INTO teachers (id, department) VALUES
(2, 'Informatique'),
(3, 'Mathématiques'),
(6, 'Chimie'),
(7, 'Physique'),
(8, 'Électronique'),
(22, 'Informatique Web'),
(23, 'Mathématiques Appliquées'),
(24, 'Systèmes Embarqués');

-- ========================================
-- Insertion des données : STUDENTS
-- ========================================
INSERT INTO students (id, student_number, major, level, date_of_birth) VALUES
(4, 'E20260001', 'Génie Logiciel', 'ING2', '2004-03-15'),
(5, 'E20260002', 'Systèmes Embarqués', 'ING2', '2004-07-22'),
(9, 'E20260003', 'Génie Logiciel', 'ING1', '2005-01-10'),
(10, 'E20260004', 'Systèmes Embarqués', 'ING2', '2004-05-18'),
(11, 'E20260005', 'Génie Logiciel', 'ING1', '2005-02-28'),
(12, 'E20260006', 'Génie Logiciel', 'ING2', '2003-11-05'),
(13, 'E20260007', 'Systèmes Embarqués', 'ING1', '2005-04-12'),
(14, 'E20260008', 'Génie Logiciel', 'ING2', '2003-09-20'),
(15, 'E20260009', 'Systèmes Embarqués', 'ING1', '2005-06-30'),
(16, 'E20260010', 'Génie Logiciel', 'ING2', '2004-08-14'),
(17, 'E20260011', 'Systèmes Embarqués', 'ING1', '2005-03-22'),
(18, 'E20260012', 'Génie Logiciel', 'ING2', '2004-10-11'),
(19, 'E20260013', 'Systèmes Embarqués', 'ING1', '2005-05-07'),
(20, 'E20260014', 'Génie Logiciel', 'ING1', '2005-07-19'),
(21, 'E20260015', 'Systèmes Embarqués', 'ING2', '2004-12-26'),
(25, 'E20260099', 'Finances', 'ING2', NULL),
(26, '000001', 'Finances', 'ING1', NULL);

-- ========================================
-- Insertion des données : COURSES
-- ========================================
INSERT INTO courses (id, code, title, description, teacher_id, max_capacity, status) VALUES
(1, 'CS101', 'Algorithmique Avancée', 'Cours avancé en algorithmique et structures de données', 2, 30, 'ouvert'),
(2, 'MATH201', 'Algèbre Linéaire', 'Mathématiques appliquées à l\'informatique', 3, 25, 'ouvert'),
(3, 'CHEM301', 'Chimie Organique', 'Introduction à la chimie organique', 6, 20, 'ouvert'),
(4, 'PHYS101', 'Physique I', 'Mécanique classique et dynamique', 7, 30, 'ouvert'),
(5, 'ELEC201', 'Électronique Numérique', 'Circuits numériques et logique booléenne', 8, 25, 'ouvert'),
(6, 'WEB301', 'Développement Web Avancé', 'React, Node.js et bases de données', 22, 20, 'ouvert'),
(7, 'STAT401', 'Statistiques et Probabilités', 'Théorie des probabilités et statistiques', 23, 28, 'ouvert'),
(8, 'EMBED501', 'Systèmes Embarqués', 'Programmation microcontrôleurs et temps réel', 24, 18, 'ouvert'),
(9, 'DB101', 'Bases de Données', 'Conception et gestion de bases de données', 2, 25, 'ouvert'),
(10, 'OOP301', 'Programmation Orientée Objet', 'Concepts OOP avec Java et C++', 3, 30, 'ouvert');

-- ========================================
-- Insertion des données : ENROLLMENTS
-- ========================================
INSERT INTO enrollments (id, student_id, course_id) VALUES
(1, 4, 1), (2, 4, 2), (3, 4, 9), (4, 5, 1), (5, 5, 2), (6, 5, 10), (7, 9, 1), (8, 9, 4), (9, 9, 6),
(10, 10, 2), (11, 10, 5), (12, 10, 7), (13, 11, 1), (14, 11, 3), (15, 11, 8), (16, 12, 1), (17, 12, 9), (18, 12, 10),
(19, 13, 4), (20, 13, 6), (21, 13, 7), (22, 14, 2), (23, 14, 5), (24, 14, 8), (25, 15, 1), (26, 15, 3), (27, 15, 9),
(28, 16, 2), (29, 16, 4), (30, 16, 6), (31, 17, 5), (32, 17, 7), (33, 17, 8), (34, 18, 1), (35, 18, 10), (36, 18, 9),
(37, 19, 2), (38, 19, 3), (39, 19, 4), (40, 20, 1), (41, 20, 6), (42, 20, 8), (43, 21, 2), (44, 21, 5), (45, 21, 7),
(46, 4, 3), (47, 4, 4), (48, 4, 7), (49, 4, 6);

-- ========================================
-- Insertion des données : SCHEDULES
-- ========================================
INSERT INTO schedules (id, course_id, day_of_week, start_time, end_time, room) VALUES
(1, 1, 'Lundi', '08:30:00', '10:00:00', 'Amphi A'),
(2, 2, 'Mardi', '10:30:00', '12:00:00', 'Salle B12'),
(3, 3, 'Mercredi', '13:30:00', '15:00:00', 'Labo Chimie'),
(4, 4, 'Jeudi', '09:00:00', '10:30:00', 'Amphi B'),
(5, 5, 'Vendredi', '14:00:00', '15:30:00', 'Labo Électronique'),
(6, 6, 'Lundi', '13:30:00', '15:00:00', 'Salle C5'),
(7, 7, 'Mardi', '14:00:00', '15:30:00', 'Amphi C'),
(8, 8, 'Mercredi', '10:00:00', '11:30:00', 'Labo Embarqué'),
(9, 9, 'Jeudi', '13:00:00', '14:30:00', 'Salle D7'),
(10, 10, 'Vendredi', '10:00:00', '11:30:00', 'Amphi D');

-- ========================================
-- Insertion des données : GRADES
-- ========================================
INSERT INTO grades (id, enrollment_id, cc1, cc2, final_exam, final_grade, first_name, last_name) VALUES
(1, 1, 14.00, 15.00, 13.00, 14.00, 'Emma', 'Martin'),
(2, 2, 16.00, 15.50, 14.00, 15.17, 'Emma', 'Martin'),
(3, 3, 13.00, 14.50, 12.50, 13.33, 'Emma', 'Martin'),
(4, 4, 12.00, 13.50, 11.00, 12.17, 'Lucas', 'Dubois'),
(5, 5, 15.00, 14.50, 13.50, 14.33, 'Lucas', 'Dubois'),
(6, 6, 11.00, 12.00, 10.50, 11.17, 'Lucas', 'Dubois'),
(7, 7, 13.00, 14.00, 12.00, 13.00, 'Sophie', 'Bernard'),
(8, 8, 15.00, 11.50, 10.00, 11.95, 'Sophie', 'Bernard'),
(9, 9, 14.50, 15.50, 14.00, 14.67, 'Sophie', 'Bernard'),
(10, 10, 15.00, 16.00, 14.00, 15.00, 'Antoine', 'Laurent'),
(11, 11, 12.50, 13.00, 12.00, 12.50, 'Antoine', 'Laurent'),
(12, 12, 13.00, 14.00, 13.50, 13.50, 'Antoine', 'Laurent'),
(13, 13, 11.00, 12.00, 11.00, 11.33, 'Julien', 'Moreau'),
(14, 14, 14.00, 13.50, 13.00, 13.50, 'Julien', 'Moreau'),
(15, 15, 12.50, 13.50, 12.00, 12.67, 'Julien', 'Moreau'),
(16, 16, 14.50, 15.00, 14.00, 14.50, 'Claire', 'Petit'),
(17, 17, 13.00, 14.00, 13.50, 13.50, 'Claire', 'Petit'),
(18, 18, 12.00, 13.00, 11.50, 12.17, 'Claire', 'Petit'),
(19, 19, 10.00, 11.00, 20.00, 14.30, 'Pierre', 'Rousseau'),
(20, 20, 13.50, 14.50, 13.00, 13.67, 'Pierre', 'Rousseau'),
(21, 21, 15.00, 15.50, 14.50, 15.00, 'Pierre', 'Rousseau'),
(22, 22, 11.50, 12.50, 11.00, 11.67, 'Anne', 'Michel'),
(23, 23, 14.00, 14.50, 13.50, 14.00, 'Anne', 'Michel'),
(24, 24, 12.00, 12.50, 11.50, 12.00, 'Anne', 'Michel'),
(25, 25, 13.50, 13.50, 12.50, 13.17, 'Luc', 'Lefevre'),
(26, 26, 15.50, 16.00, 15.00, 15.50, 'Luc', 'Lefevre'),
(27, 27, 11.00, 11.50, 10.50, 11.00, 'Luc', 'Lefevre'),
(28, 28, 14.00, 14.50, 13.00, 13.83, 'Marie', 'Dupont'),
(29, 29, 12.50, 13.00, 12.00, 12.50, 'Marie', 'Dupont'),
(30, 30, 15.00, 15.50, 15.00, 15.17, 'Marie', 'Dupont'),
(31, 31, 10.50, 11.00, 10.50, 10.67, 'Victor', 'Girard'),
(32, 32, 13.00, 13.50, 12.50, 13.00, 'Victor', 'Girard'),
(33, 33, 12.00, 12.50, 11.50, 12.00, 'Victor', 'Girard'),
(34, 34, 16.00, 16.50, 15.50, 16.00, 'Isabelle', 'Robert'),
(35, 35, 13.50, 14.00, 13.00, 13.50, 'Isabelle', 'Robert'),
(36, 36, 14.00, 14.50, 14.00, 14.17, 'Isabelle', 'Robert'),
(37, 37, 11.00, 11.50, 10.50, 11.00, 'Thomas', 'Fournier'),
(38, 38, 13.50, 14.00, 13.00, 13.50, 'Thomas', 'Fournier'),
(39, 39, 12.00, 12.50, 12.00, 12.17, 'Thomas', 'Fournier'),
(40, 40, 15.00, 15.50, 15.00, 15.17, 'Nathalie', 'Leclerc'),
(41, 41, 12.50, 13.00, 12.50, 12.67, 'Nathalie', 'Leclerc'),
(42, 42, 14.00, 14.50, 13.50, 14.00, 'Nathalie', 'Leclerc'),
(43, 43, 13.00, 13.50, 13.00, 13.17, 'David', 'Fontaine'),
(44, 44, 11.50, 12.00, 11.00, 11.50, 'David', 'Fontaine'),
(45, 45, 14.50, 15.00, 14.50, 14.67, 'David', 'Fontaine'),
(46, 48, NULL, NULL, NULL, NULL, 'Emma', 'Martin'),
(47, 49, NULL, NULL, NULL, NULL, 'Emma', 'Martin'),
(48, 46, 10.00, 10.00, 10.00, 10.00, 'Emma', 'Martin'),
(49, 47, 20.00, 12.00, 17.75, 16.70, 'Emma', 'Martin');

-- ========================================
-- Fin du script
-- ========================================
