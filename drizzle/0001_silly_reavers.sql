/*
 SQLite does not support altering a table to add a foreign key constraint or a NOT NULL column with no default value.
 We must therefore recreate the table.
*/

-- Create the new curriculums table
CREATE TABLE `curriculums` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`subtitle` text NOT NULL,
	`goal` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Drop the old quests table
DROP TABLE `quests`;

-- Recreate the quests table with the new curriculum_id foreign key
CREATE TABLE `quests` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`xp` integer NOT NULL,
    `orbs` integer DEFAULT 0,
	`status` text NOT NULL,
	`position_top` text NOT NULL,
	`position_left` text NOT NULL,
	`curriculum_id` text NOT NULL,
	FOREIGN KEY (`curriculum_id`) REFERENCES `curriculums`(`id`) ON UPDATE no action ON DELETE no action
);

-- Note: All previous quest data is lost in this process.
-- You might want to back up and restore data if this were a production environment.
