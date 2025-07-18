
ALTER TABLE users ADD `must_change_password` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE users ADD `status` text DEFAULT 'active' NOT NULL;
