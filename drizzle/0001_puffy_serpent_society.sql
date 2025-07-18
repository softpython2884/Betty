CREATE TABLE `curriculums` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`subtitle` text NOT NULL,
	`goal` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `quests` ADD `orbs` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `quests` ADD `curriculum_id` text REFERENCES `curriculums`(`id`);--> statement-breakpoint
ALTER TABLE `quests` ADD `status` text;