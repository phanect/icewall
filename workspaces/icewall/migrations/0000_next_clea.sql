CREATE TABLE `IcewallSessions` (
	`id` text PRIMARY KEY NOT NULL,
	`fresh` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `IcewallUsers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `IcewallUsers` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`githubId` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IcewallUsers_username_unique` ON `IcewallUsers` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `IcewallUsers_githubId_unique` ON `IcewallUsers` (`githubId`);