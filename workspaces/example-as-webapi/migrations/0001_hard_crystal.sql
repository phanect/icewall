ALTER TABLE `IcewallUsers` RENAME COLUMN "username" TO "email";--> statement-breakpoint
DROP INDEX `IcewallUsers_username_unique`;--> statement-breakpoint
ALTER TABLE `IcewallUsers` ADD `githubDisplayId` text;--> statement-breakpoint
CREATE UNIQUE INDEX `IcewallUsers_email_unique` ON `IcewallUsers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `IcewallUsers_githubDisplayId_unique` ON `IcewallUsers` (`githubDisplayId`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_IcewallSessions` (
	`id` text PRIMARY KEY NOT NULL,
	`fresh` integer DEFAULT true,
	`expiresAt` integer NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `IcewallUsers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_IcewallSessions`("id", "fresh", "expiresAt", "userId") SELECT "id", "fresh", "expiresAt", "userId" FROM `IcewallSessions`;--> statement-breakpoint
DROP TABLE `IcewallSessions`;--> statement-breakpoint
ALTER TABLE `__new_IcewallSessions` RENAME TO `IcewallSessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;