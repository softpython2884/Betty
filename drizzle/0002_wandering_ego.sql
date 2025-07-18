CREATE TABLE `curriculum_assignments` (
	`curriculum_id` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`curriculum_id`) REFERENCES `curriculums`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `curriculum_assignments` ADD `status` text DEFAULT 'not-started' NOT NULL;--> statement-breakpoint
ALTER TABLE `curriculum_assignments` ADD `completed_at` integer;--> statement-breakpoint
ALTER TABLE `curriculum_assignments` ADD `progress` integer DEFAULT 0;--> statement-breakpoint
/*
 SQLite does not support "Creating multiple primary keys". Following query can't be executed:
ALTER TABLE curriculum_assignments ADD PRIMARY KEY(curriculum_id, user_id);
*/