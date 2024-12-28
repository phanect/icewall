CREATE TABLE `IcedGateSessions` (
	`id` text PRIMARY KEY NOT NULL,
	`fresh` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `IcedGateUsers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `IcedGateUsers` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`githubId` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IcedGateUsers_username_unique` ON `IcedGateUsers` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `IcedGateUsers_githubId_unique` ON `IcedGateUsers` (`githubId`);