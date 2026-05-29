-- Seed: Complete data for SmartCampus
-- Includes 1 Admin, 5 Teachers, 15 Students, 10 Courses with schedules, enrollments and grades

USE `smartcampus_db`;

START TRANSACTION;

-- ========================
-- Clear existing data (keep admin/teacher1/teacher2/student1/student2)
-- ========================
DELETE FROM grades WHERE enrollment_id > 3;
DELETE FROM enrollments WHERE id > 3;
DELETE FROM schedules;
DELETE FROM courses WHERE id > 2;
DELETE FROM students WHERE id > 5;
DELETE FROM teachers WHERE id > 3;
DELETE FROM users WHERE id > 5;

-- ========================
-- Additional Users (Admin + Teachers + Students)
-- ========================
-- Admin already exists (id: 1)
-- Teachers: 2-3 exist, add 4-6
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `first_name`, `last_name`, `created_at`, `updated_at`) VALUES
(6, 'teacher3@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Marie', 'Curie', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(7, 'teacher4@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Albert', 'Einstein', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(8, 'teacher5@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Richard', 'Feynman', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(22, 'teacher6@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Nikola', 'Tesla', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(23, 'teacher7@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Grace', 'Hopper', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(24, 'teacher8@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Carl', 'Gauss', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
-- Students: 4-5 exist, add 6-20
(9, 'student3@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Sophie', 'Bernard', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(10, 'student4@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Antoine', 'Laurent', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(11, 'student5@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Julien', 'Moreau', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(12, 'student6@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Claire', 'Petit', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(13, 'student7@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Pierre', 'Rousseau', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(14, 'student8@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Anne', 'Michel', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(15, 'student9@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Luc', 'Lefevre', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(16, 'student10@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Marie', 'Dupont', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(17, 'student11@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Victor', 'Girard', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(18, 'student12@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Isabelle', 'Robert', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(19, 'student13@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Thomas', 'Fournier', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(20, 'student14@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Nathalie', 'Leclerc', '2026-05-25 09:17:08', '2026-05-25 09:17:08'),
(21, 'student15@smartcampus.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'David', 'Fontaine', '2026-05-25 09:17:08', '2026-05-25 09:17:08');

-- ========================
-- Teachers entries (linking to users)
-- ========================
-- Teachers 2-3 exist, add 6-11
INSERT INTO `teachers` (`id`, `department`) VALUES
(6, 'Électronique'),
(7, 'Informatique Web'),
(8, 'Mathématiques Appliquées'),
(22, 'Physique'),
(23, 'Informatique'),
(24, 'Chimie');

-- ========================
-- Students entries (linking to users)
-- ========================
-- Students 4-5 exist, add 9-21
INSERT INTO `students` (`id`, `student_number`, `major`, `level`, `date_of_birth`) VALUES
(9, 'E20260003', 'Génie Logiciel', 'ING2', '2005-11-10'),
(10, 'E20260004', 'Systèmes Embarqués', 'ING2', '2005-08-25'),
(11, 'E20260005', 'Génie Logiciel', 'ING3', '2004-01-17'),
(12, 'E20260006', 'Systèmes Embarqués', 'ING3', '2004-04-30'),n
(14, 'E20260008', 'Génie Logiciel', 'ING2', '2005-06-05'),
(15, 'E20260009', 'Informatique', 'ING3', '2004-02-28'),
(16, 'E20260010', 'Électronique', 'ING3', '2003-12-14'),
(17, 'E20260011', 'Génie Logiciel', 'ING2', '2005-10-20'),
(18, 'E20260012', 'Systèmes Embarqués', 'ING2', '2005-07-08'),
(19, 'E20260013', 'Génie Logiciel', 'ING3', '2004-05-15'),
(20, 'E20260014', 'Informatique', 'ING2', '2005-03-22'),
(21, 'E20260015', 'Électronique', 'ING2', '2005-11-03');

-- ========================
-- Courses (10 total)
-- ========================
-- Existing courses (1-2), add new ones (3-10)
INSERT INTO `courses` (`id`, `code`, `title`, `description`, `teacher_id`, `max_capacity`, `status`, `created_at`) VALUES
(3, 'WEB301', 'Web Dynamique', 'Développement d\'applications web dynamiques', 2, 35, 'ouvert', '2026-05-25 09:17:08'),
(4, 'ELEC101', 'Électronique', 'Circuits électroniques et composants', 6, 30, 'ouvert', '2026-05-25 09:17:08'),
(5, 'PROG101', 'Programmation Orientée Objet', 'POO en Java et Python', 2, 40, 'ouvert', '2026-05-25 09:17:08'),
(6, 'STAT201', 'Statistiques Appliquées', 'Analyse statistique et probabilités', 3, 35, 'ouvert', '2026-05-25 09:17:08'),
(7, 'DSGN101', 'Design Patterns', 'Motifs de conception logiciels', 7, 30, 'ouvert', '2026-05-25 09:17:08'),
(8, 'DB201', 'Bases de Données Avancées', 'SQL et NoSQL', 8, 35, 'ouvert', '2026-05-25 09:17:08'),
(9, 'PHYS201', 'Physique Numérique', 'Simulation et calcul scientifique', 6, 25, 'ouvert', '2026-05-25 09:17:08'),
(10, 'ARCH101', 'Architecture Logicielle', 'Conception d\'architectures', 7, 28, 'ouvert', '2026-05-25 09:17:08');

-- ========================
-- Schedules (10 courses with schedules)
-- ========================
INSERT INTO `schedules` (`id`, `course_id`, `day_of_week`, `start_time`, `end_time`, `room`) VALUES
(1, 1, 'Lundi', '08:30:00', '10:00:00', 'Amphi A'),
(2, 2, 'Mardi', '10:30:00', '12:00:00', 'Salle B12'),
(3, 3, 'Lundi', '14:00:00', '15:30:00', 'Amphi B'),
(4, 4, 'Mercredi', '09:00:00', '10:30:00', 'Salle C1'),
(5, 5, 'Jeudi', '10:30:00', '12:00:00', 'Amphi C'),
(6, 6, 'Lundi', '13:00:00', '14:30:00', 'Salle D2'),
(7, 7, 'Mardi', '14:00:00', '15:30:00', 'Salle E1'),
(8, 8, 'Mercredi', '13:00:00', '14:30:00', 'Salle F3'),
(9, 9, 'Vendredi', '08:30:00', '10:00:00', 'Amphi D'),
(10, 10, 'Jeudi', '13:30:00', '15:00:00', 'Salle G2');

-- ========================
-- Enrollments (Students registered to courses)
-- ========================
-- Existing enrollments (1-3), add new ones
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrolled_at`) VALUES
-- Emma Martin (student_id 4): enrolled to courses 1, 2, 3
-- Lucas Dubois (student_id 5): enrolled to courses 1, 2
-- New students with various enrollments
(4, 9, 1, '2026-05-25 09:17:08'),
(5, 9, 2, '2026-05-25 09:17:08'),
(6, 10, 1, '2026-05-25 09:17:08'),
(7, 10, 3, '2026-05-25 09:17:08'),
(8, 11, 2, '2026-05-25 09:17:08'),
(9, 11, 4, '2026-05-25 09:17:08'),
(10, 12, 1, '2026-05-25 09:17:08'),
(11, 12, 5, '2026-05-25 09:17:08'),
(12, 13, 3, '2026-05-25 09:17:08'),
(13, 13, 4, '2026-05-25 09:17:08'),
(14, 14, 2, '2026-05-25 09:17:08'),
(15, 14, 6, '2026-05-25 09:17:08'),
(16, 15, 1, '2026-05-25 09:17:08'),
(17, 15, 7, '2026-05-25 09:17:08'),
(18, 16, 4, '2026-05-25 09:17:08'),
(19, 16, 8, '2026-05-25 09:17:08'),
(20, 17, 2, '2026-05-25 09:17:08'),
(21, 17, 9, '2026-05-25 09:17:08'),
(22, 18, 1, '2026-05-25 09:17:08'),
(23, 18, 10, '2026-05-25 09:17:08'),
(24, 19, 3, '2026-05-25 09:17:08'),
(25, 19, 5, '2026-05-25 09:17:08'),
(26, 20, 4, '2026-05-25 09:17:08'),
(27, 20, 6, '2026-05-25 09:17:08'),
(28, 21, 7, '2026-05-25 09:17:08'),
(29, 21, 8, '2026-05-25 09:17:08');

-- ========================
-- Grades (Sample grades for enrollments)
-- ========================
INSERT INTO `grades` (`id`, `enrollment_id`, `cc1`, `cc2`, `final_exam`, `final_grade`) VALUES
(1, 1, 14.00, 15.00, 13.00, 14.00),
(2, 2, 12.00, 13.50, 11.00, 12.17),
(3, 3, 15.00, 14.50, 13.50, 14.33),
(4, 4, 13.00, 14.00, 12.00, 13.00),
(5, 5, 11.50, 13.00, 12.00, 12.17),
(6, 6, 15.00, 16.00, 14.00, 15.00),
(7, 7, 10.00, 12.00, 11.00, 11.00),
(8, 8, 14.50, 15.00, 14.00, 14.50),
(9, 9, 13.50, 13.00, 12.50, 13.00),
(10, 10, 12.00, 14.50, 13.00, 13.17),
(11, 11, 16.00, 15.50, 14.50, 15.33),
(12, 12, 11.00, 12.50, 10.50, 11.33),
(13, 13, 14.00, 13.50, 12.50, 13.33),
(14, 14, 13.50, 14.00, 13.00, 13.50),
(15, 15, 15.50, 16.00, 15.00, 15.50),
(16, 16, 12.50, 13.00, 11.50, 12.33),
(17, 17, 14.00, 15.00, 14.00, 14.33),
(18, 18, 11.50, 12.50, 12.00, 12.00),
(19, 19, 13.00, 14.50, 13.50, 13.67),
(20, 20, 15.00, 14.50, 15.00, 14.83),
(21, 21, 10.50, 11.50, 10.00, 10.50),
(22, 22, 14.50, 15.50, 14.00, 14.67),
(23, 23, 12.50, 13.50, 13.00, 13.00),
(24, 24, 16.00, 16.50, 15.50, 16.00),
(25, 25, 13.00, 12.50, 12.00, 12.50),
(26, 26, 11.00, 13.00, 11.50, 11.83),
(27, 27, 14.00, 14.50, 13.50, 14.00);

-- ========================
-- AUTO_INCREMENT adjustments
-- ========================
ALTER TABLE `users` AUTO_INCREMENT = 25;
ALTER TABLE `teachers` AUTO_INCREMENT = 25;
ALTER TABLE `students` AUTO_INCREMENT = 22;
ALTER TABLE `courses` AUTO_INCREMENT = 11;
ALTER TABLE `enrollments` AUTO_INCREMENT = 30;
ALTER TABLE `grades` AUTO_INCREMENT = 28;
ALTER TABLE `schedules` AUTO_INCREMENT = 11;

COMMIT;
