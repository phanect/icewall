import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "../src/lib/lucia/prisma-adapter.ts";
import { testAdapter, databaseUser } from "./utils/test-adapter.ts";

const client = new PrismaClient();

const adapter = new PrismaAdapter(client.session, client.user);

await client.user.create({
  data: {
    id: databaseUser.id,
    ...databaseUser.attributes,
  },
});

await testAdapter(adapter);

await client.session.deleteMany();
await client.user.deleteMany();

declare module "lucia" {
  type Register = {
    DatabaseUserAttributes: {
      username: string;
    };
  };
}
