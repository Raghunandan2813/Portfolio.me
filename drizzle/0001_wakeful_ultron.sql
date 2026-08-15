CREATE TABLE `cache_entries` (
	`key` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`fresh_until` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL
);
