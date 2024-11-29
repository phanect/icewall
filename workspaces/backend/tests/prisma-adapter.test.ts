import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "../src/libs/prisma-adapter.ts";
import { testAdapter, databaseUser } from "./utils/test-adapter.ts";

const client = new PrismaClient();

const adapter = new PrismaAdapter(client);

await client.icedGateUser.create({
  data: {
    id: databaseUser.id,
    ...databaseUser.attributes,
  },
});

await testAdapter(adapter);

await client.icedGateSession.deleteMany();
await client.icedGateUser.deleteMany();
