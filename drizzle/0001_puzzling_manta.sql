CREATE TABLE `quest_completions` (
	`user_id` text NOT NULL,
	`quest_id` text NOT NULL,
	`completed_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`quest_id`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE no action,
	PRIMARY KEY(`user_id`, `quest_id`)
);
