-- Seed: additional courses, enrollments, grades and schedules for SmartCampus
-- File: sql/seed_additional_data.sql

USE `smartcampus_db`;

START TRANSACTION;

-- New courses
INSERT INTO `courses` (`id`, `code`, `title`, `description`, `teacher_id`, `max_capacity`, `status`, `created_at`) VALUES
(3, 'EMG101', 'Électromagnétisme', NULL, 2, 30, 'ouvert', '2026-05-25 09:17:08'),
(4, 'ANL101', 'Analyse et Algèbre', NULL, 3, 35, 'ouvert', '2026-05-25 09:17:08'),
(5, 'WEB301', 'Web Dynamique', NULL, 2, 40, 'ouvert', '2026-05-25 09:17:08'),
(6, 'ELEC101', 'Électronique', NULL, 3, 30, 'ouvert', '2026-05-25 09:17:08');

-- New enrollments (students id 4 & 5 exist in dump)
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrolled_at`) VALUES
(4, 4, 3, '2026-09-01 08:30:00'),
(5, 5, 3, '2026-09-01 08:30:00'),
(6, 4, 4, '2026-09-01 10:00:00'),
(7, 5, 5, '2026-09-02 11:00:00'),
(8, 4, 5, '2026-09-03 09:00:00'),
(9, 5, 6, '2026-09-04 14:00:00');

-- Fictitious grades for each enrollment (cc1, cc2, final_exam, final_grade)
INSERT INTO `grades` (`id`, `enrollment_id`, `cc1`, `cc2`, `final_exam`, `final_grade`) VALUES
(1, 1, 14.00, 15.00, 13.00, 14.00),
(2, 2, 12.00, 13.50, 11.00, 12.17),
(3, 3, 15.00, 14.50, 13.50, 14.33),
(4, 4, 13.00, 14.00, 12.00, 13.00),
(5, 5, 11.50, 13.00, 12.00, 12.17),
(6, 6, 15.00, 16.00, 14.00, 15.00),
(7, 7, 10.00, 12.00, 11.00, 11.00),
(8, 8, 14.50, 15.00, 14.00, 14.50),
(9, 9, 13.50, 13.00, 12.50, 13.00);

-- Additional schedules for the new courses
INSERT INTO `schedules` (`id`, `course_id`, `day_of_week`, `start_time`, `end_time`, `room`) VALUES
(3, 3, 'Mercredi', '09:00:00', '10:30:00', 'Amphi B'),
(4, 4, 'Jeudi', '11:00:00', '12:30:00', 'Salle C1'),
(5, 5, 'Vendredi', '14:00:00', '15:30:00', 'Salle D2'),
(6, 6, 'Lundi', '13:30:00', '15:00:00', 'Salle E3');

-- Ensure AUTO_INCREMENT values are ahead of inserted ids
ALTER TABLE `courses` AUTO_INCREMENT = 7;
ALTER TABLE `enrollments` AUTO_INCREMENT = 10;
ALTER TABLE `grades` AUTO_INCREMENT = 10;
ALTER TABLE `schedules` AUTO_INCREMENT = 7;

COMMIT;
