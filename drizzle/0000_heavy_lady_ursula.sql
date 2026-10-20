CREATE TABLE `accessibility_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`place_id` text NOT NULL,
	`author_id` text NOT NULL,
	`author_name` text NOT NULL,
	`visited_at` text NOT NULL,
	`created_at` text NOT NULL,
	`features` text NOT NULL,
	`observation` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reports_place_created_idx` ON `accessibility_reports` (`place_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `reports_author_created_idx` ON `accessibility_reports` (`author_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `community_places` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`area` text NOT NULL,
	`address` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `places_author_created_idx` ON `community_places` (`author_id`,`created_at`);