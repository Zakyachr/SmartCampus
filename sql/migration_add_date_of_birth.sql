-- Migration: Add date_of_birth column to students table
-- This script adds the date_of_birth column to the existing students table

USE `smartcampus_db`;

-- Add the date_of_birth column if it doesn't exist
ALTER TABLE `students` ADD COLUMN `date_of_birth` date DEFAULT NULL;

-- Update existing students with birth dates (these are the initial 2 students)
UPDATE `students` SET `date_of_birth` = '2004-03-15' WHERE `id` = 4;
UPDATE `students` SET `date_of_birth` = '2004-07-22' WHERE `id` = 5;

-- If you already have data from seed_additional_data.sql, update those too:
UPDATE `students` SET `date_of_birth` = '2005-11-10' WHERE `id` = 9;
UPDATE `students` SET `date_of_birth` = '2005-08-25' WHERE `id` = 10;
UPDATE `students` SET `date_of_birth` = '2004-01-17' WHERE `id` = 11;
UPDATE `students` SET `date_of_birth` = '2004-04-30' WHERE `id` = 12;
UPDATE `students` SET `date_of_birth` = '2005-09-12' WHERE `id` = 13;
UPDATE `students` SET `date_of_birth` = '2005-06-05' WHERE `id` = 14;
UPDATE `students` SET `date_of_birth` = '2004-02-28' WHERE `id` = 15;
UPDATE `students` SET `date_of_birth` = '2003-12-14' WHERE `id` = 16;
UPDATE `students` SET `date_of_birth` = '2005-10-20' WHERE `id` = 17;
UPDATE `students` SET `date_of_birth` = '2005-07-08' WHERE `id` = 18;
UPDATE `students` SET `date_of_birth` = '2004-05-15' WHERE `id` = 19;
UPDATE `students` SET `date_of_birth` = '2005-03-22' WHERE `id` = 20;
UPDATE `students` SET `date_of_birth` = '2005-11-03' WHERE `id` = 21;
