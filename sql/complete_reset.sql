-- SmartCampus Database Complete Reset and Rebuild
-- Reinitialize with clean data: users, students, teachers, courses, enrollments, and grades

USE `smartcampus_db`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;

-- ========================
-- CLEAR ALL DATA
-- ========================
DELETE FROM grades;
DELETE FROM schedules;
DELETE FROM enrollments;
DELETE FROM courses;
DELETE FROM teachers;
DELETE FROM students;
DELETE FROM users;

-- Reset AUTO_INCREMENT
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE students AUTO_INCREMENT = 1;
ALTER TABLE teachers AUTO_INCREMENT = 1;
ALTER TABLE courses AUTO_INCREMENT = 1;
ALTER TABLE enrollments AUTO_INCREMENT = 1;
ALTER TABLE grades AUTO_INCREMENT = 1;

-- ========================
-- USERS: 1 Admin + 8 Teachers + 15 Students = 24 total
-- Password hash: 123456 (bcrypt)
-- ========================
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `first_name`, `last_name`, `created_at`, `updated_at`) VALUES
-- Admin
(1, 'admin1@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Super', 'Admin', NOW(), NOW()),

-- Teachers
(2, 'teacher1@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Alan', 'Turing', NOW(), NOW()),
(3, 'teacher2@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Ada', 'Lovelace', NOW(), NOW()),
(6, 'teacher3@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Marie', 'Curie', NOW(), NOW()),
(7, 'teacher4@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Albert', 'Einstein', NOW(), NOW()),
(8, 'teacher5@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Richard', 'Feynman', NOW(), NOW()),
(22, 'teacher6@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Nikola', 'Tesla', NOW(), NOW()),
(23, 'teacher7@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Grace', 'Hopper', NOW(), NOW()),
(24, 'teacher8@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Carl', 'Gauss', NOW(), NOW()),

-- Students
(4, 'student1@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Emma', 'Martin', NOW(), NOW()),
(5, 'student2@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Lucas', 'Dubois', NOW(), NOW()),
(9, 'student3@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Sophie', 'Bernard', NOW(), NOW()),
(10, 'student4@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Antoine', 'Laurent', NOW(), NOW()),
(11, 'student5@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Julien', 'Moreau', NOW(), NOW()),
(12, 'student6@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Claire', 'Petit', NOW(), NOW()),
(13, 'student7@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Pierre', 'Rousseau', NOW(), NOW()),
(14, 'student8@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Anne', 'Michel', NOW(), NOW()),
(15, 'student9@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Luc', 'Lefevre', NOW(), NOW()),
(16, 'student10@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Marie', 'Dupont', NOW(), NOW()),
(17, 'student11@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Victor', 'Girard', NOW(), NOW()),
(18, 'student12@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Isabelle', 'Robert', NOW(), NOW()),
(19, 'student13@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Thomas', 'Fournier', NOW(), NOW()),
(20, 'student14@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Nathalie', 'Leclerc', NOW(), NOW()),
(21, 'student15@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'David', 'Fontaine', NOW(), NOW());

-- ========================
-- TEACHERS entries (8 teachers)
-- ========================
INSERT INTO `teachers` (`id`, `department`) VALUES
(2, 'Informatique'),
(3, 'Mathématiques'),
(6, 'Chimie'),
(7, 'Physique'),
(8, 'Électronique'),
(22, 'Informatique Web'),
(23, 'Mathématiques Appliquées'),
(24, 'Systèmes Embarqués');

-- ========================
-- STUDENTS entries (15 students with birth dates 2003-2005)
-- ========================
INSERT INTO `students` (`id`, `student_number`, `major`, `level`, `date_of_birth`) VALUES
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
(21, 'E20260015', 'Systèmes Embarqués', 'ING2', '2004-12-26');

-- ========================
-- COURSES (10 courses with various teachers)
-- ========================
INSERT INTO `courses` (`id`, `code`, `title`, `description`, `teacher_id`, `max_capacity`, `status`, `created_at`) VALUES
(1, 'CS101', 'Algorithmique Avancée', 'Cours avancé en algorithmique et structures de données', 2, 30, 'ouvert', NOW()),
(2, 'MATH201', 'Algèbre Linéaire', 'Mathématiques appliquées à l\'informatique', 3, 25, 'ouvert', NOW()),
(3, 'CHEM301', 'Chimie Organique', 'Introduction à la chimie organique', 6, 20, 'ouvert', NOW()),
(4, 'PHYS101', 'Physique I', 'Mécanique classique et dynamique', 7, 30, 'ouvert', NOW()),
(5, 'ELEC201', 'Électronique Numérique', 'Circuits numériques et logique booléenne', 8, 25, 'ouvert', NOW()),
(6, 'WEB301', 'Développement Web Avancé', 'React, Node.js et bases de données', 22, 20, 'ouvert', NOW()),
(7, 'STAT401', 'Statistiques et Probabilités', 'Théorie des probabilités et statistiques', 23, 28, 'ouvert', NOW()),
(8, 'EMBED501', 'Systèmes Embarqués', 'Programmation microcontrôleurs et temps réel', 24, 18, 'ouvert', NOW()),
(9, 'DB101', 'Bases de Données', 'Conception et gestion de bases de données', 2, 25, 'ouvert', NOW()),
(10, 'OOP301', 'Programmation Orientée Objet', 'Concepts OOP avec Java et C++', 3, 30, 'ouvert', NOW());

-- ========================
-- ENROLLMENTS (Each student enrolled in 2-3 courses)
-- ========================
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrolled_at`) VALUES
-- Emma Martin (4): CS101, MATH201, DB101
(1, 4, 1, NOW()),
(2, 4, 2, NOW()),
(3, 4, 9, NOW()),

-- Lucas Dubois (5): CS101, MATH201, OOP301
(4, 5, 1, NOW()),
(5, 5, 2, NOW()),
(6, 5, 10, NOW()),

-- Sophie Bernard (9): CS101, PHYS101, WEB301
(7, 9, 1, NOW()),
(8, 9, 4, NOW()),
(9, 9, 6, NOW()),

-- Antoine Laurent (10): MATH201, ELEC201, STAT401
(10, 10, 2, NOW()),
(11, 10, 5, NOW()),
(12, 10, 7, NOW()),

-- Julien Moreau (11): CS101, CHEM301, EMBED501
(13, 11, 1, NOW()),
(14, 11, 3, NOW()),
(15, 11, 8, NOW()),

-- Claire Petit (12): CS101, DB101, OOP301
(16, 12, 1, NOW()),
(17, 12, 9, NOW()),
(18, 12, 10, NOW()),

-- Pierre Rousseau (13): PHYS101, WEB301, STAT401
(19, 13, 4, NOW()),
(20, 13, 6, NOW()),
(21, 13, 7, NOW()),

-- Anne Michel (14): MATH201, ELEC201, EMBED501
(22, 14, 2, NOW()),
(23, 14, 5, NOW()),
(24, 14, 8, NOW()),

-- Luc Lefevre (15): CS101, CHEM301, DB101
(25, 15, 1, NOW()),
(26, 15, 3, NOW()),
(27, 15, 9, NOW()),

-- Marie Dupont (16): MATH201, PHYS101, WEB301
(28, 16, 2, NOW()),
(29, 16, 4, NOW()),
(30, 16, 6, NOW()),

-- Victor Girard (17): ELEC201, STAT401, EMBED501
(31, 17, 5, NOW()),
(32, 17, 7, NOW()),
(33, 17, 8, NOW()),

-- Isabelle Robert (18): CS101, OOP301, DB101
(34, 18, 1, NOW()),
(35, 18, 10, NOW()),
(36, 18, 9, NOW()),

-- Thomas Fournier (19): MATH201, CHEM301, PHYS101
(37, 19, 2, NOW()),
(38, 19, 3, NOW()),
(39, 19, 4, NOW()),

-- Nathalie Leclerc (20): CS101, WEB301, EMBED501
(40, 20, 1, NOW()),
(41, 20, 6, NOW()),
(42, 20, 8, NOW()),

-- David Fontaine (21): MATH201, ELEC201, STAT401
(43, 21, 2, NOW()),
(44, 21, 5, NOW()),
(45, 21, 7, NOW());

-- ========================
-- GRADES (Generate random grades for all enrollments 1-45)
-- Formula: (CC1*0.3 + CC2*0.3 + Exam*0.4)
-- ========================
INSERT INTO `grades` (`id`, `enrollment_id`, `cc1`, `cc2`, `final_exam`, `final_grade`) VALUES
-- Enrollment 1-3 (Emma Martin)
(1, 1, 14.00, 15.00, 13.00, 14.00),
(2, 2, 16.00, 15.50, 14.00, 15.17),
(3, 3, 13.00, 14.50, 12.50, 13.33),

-- Enrollment 4-6 (Lucas Dubois)
(4, 4, 12.00, 13.50, 11.00, 12.17),
(5, 5, 15.00, 14.50, 13.50, 14.33),
(6, 6, 11.00, 12.00, 10.50, 11.17),

-- Enrollment 7-9 (Sophie Bernard)
(7, 7, 13.00, 14.00, 12.00, 13.00),
(8, 8, 10.50, 11.50, 10.00, 10.50),
(9, 9, 14.50, 15.50, 14.00, 14.67),

-- Enrollment 10-12 (Antoine Laurent)
(10, 10, 15.00, 16.00, 14.00, 15.00),
(11, 11, 12.50, 13.00, 12.00, 12.50),
(12, 12, 13.00, 14.00, 13.50, 13.50),

-- Enrollment 13-15 (Julien Moreau)
(13, 13, 11.00, 12.00, 11.00, 11.33),
(14, 14, 14.00, 13.50, 13.00, 13.50),
(15, 15, 12.50, 13.50, 12.00, 12.67),

-- Enrollment 16-18 (Claire Petit)
(16, 16, 14.50, 15.00, 14.00, 14.50),
(17, 17, 13.00, 14.00, 13.50, 13.50),
(18, 18, 12.00, 13.00, 11.50, 12.17),

-- Enrollment 19-21 (Pierre Rousseau)
(19, 19, 10.00, 11.00, 10.00, 10.33),
(20, 20, 13.50, 14.50, 13.00, 13.67),
(21, 21, 15.00, 15.50, 14.50, 15.00),

-- Enrollment 22-24 (Anne Michel)
(22, 22, 11.50, 12.50, 11.00, 11.67),
(23, 23, 14.00, 14.50, 13.50, 14.00),
(24, 24, 12.00, 12.50, 11.50, 12.00),

-- Enrollment 25-27 (Luc Lefevre)
(25, 25, 13.50, 13.50, 12.50, 13.17),
(26, 26, 15.50, 16.00, 15.00, 15.50),
(27, 27, 11.00, 11.50, 10.50, 11.00),

-- Enrollment 28-30 (Marie Dupont)
(28, 28, 14.00, 14.50, 13.00, 13.83),
(29, 29, 12.50, 13.00, 12.00, 12.50),
(30, 30, 15.00, 15.50, 15.00, 15.17),

-- Enrollment 31-33 (Victor Girard)
(31, 31, 10.50, 11.00, 10.50, 10.67),
(32, 32, 13.00, 13.50, 12.50, 13.00),
(33, 33, 12.00, 12.50, 11.50, 12.00),

-- Enrollment 34-36 (Isabelle Robert)
(34, 34, 16.00, 16.50, 15.50, 16.00),
(35, 35, 13.50, 14.00, 13.00, 13.50),
(36, 36, 14.00, 14.50, 14.00, 14.17),

-- Enrollment 37-39 (Thomas Fournier)
(37, 37, 11.00, 11.50, 10.50, 11.00),
(38, 38, 13.50, 14.00, 13.00, 13.50),
(39, 39, 12.00, 12.50, 12.00, 12.17),

-- Enrollment 40-42 (Nathalie Leclerc)
(40, 40, 15.00, 15.50, 15.00, 15.17),
(41, 41, 12.50, 13.00, 12.50, 12.67),
(42, 42, 14.00, 14.50, 13.50, 14.00),

-- Enrollment 43-45 (David Fontaine)
(43, 43, 13.00, 13.50, 13.00, 13.17),
(44, 44, 11.50, 12.00, 11.00, 11.50),
(45, 45, 14.50, 15.00, 14.50, 14.67);

-- ========================
-- Update grades with student names from users table
-- ========================
UPDATE `grades` g
JOIN `enrollments` e ON g.enrollment_id = e.id
JOIN `users` u ON e.student_id = u.id
SET g.first_name = u.first_name, g.last_name = u.last_name;

-- ========================
-- SCHEDULES (Sample schedules for each course)
-- ========================
INSERT INTO `schedules` (`id`, `course_id`, `day_of_week`, `start_time`, `end_time`, `room`) VALUES
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

COMMIT;

-- Verify data was inserted
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as students_count FROM students;
SELECT COUNT(*) as teachers_count FROM teachers;
SELECT COUNT(*) as courses_count FROM courses;
SELECT COUNT(*) as enrollments_count FROM enrollments;
SELECT COUNT(*) as grades_count FROM grades;
