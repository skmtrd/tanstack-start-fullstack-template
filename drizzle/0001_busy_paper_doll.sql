ALTER TABLE `todos` ADD `user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `todos` ADD `completed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `todos` ADD `updated_at` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
CREATE INDEX `todos_user_id_idx` ON `todos` (`user_id`);