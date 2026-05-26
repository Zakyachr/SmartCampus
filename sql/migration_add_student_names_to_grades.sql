-- Migration: Add student first_name and last_name to grades table
-- This adds denormalization for easier access to student names in grades data

ALTER TABLE `grades` 
ADD COLUMN `first_name` VARCHAR(100) DEFAULT NULL AFTER `final_grade`,
ADD COLUMN `last_name` VARCHAR(100) DEFAULT NULL AFTER `first_name`;

-- Populate existing grades with student names
UPDATE `grades` g
JOIN `enrollments` e ON g.enrollment_id = e.id
JOIN `users` u ON e.student_id = u.id
SET g.first_name = u.first_name, g.last_name = u.last_name;

-- Add index for faster queries
CREATE INDEX `idx_grades_student_names` ON `grades` (`last_name`, `first_name`);
