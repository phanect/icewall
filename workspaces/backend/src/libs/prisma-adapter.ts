import type { PrismaClient, IcedGateSession, IcedGateUser } from "@prisma/client";
import type {
  Adapter,
  DatabaseSession,
  DatabaseUser,
} from "./database.ts";

const transformIntoDatabaseSession = (raw: IcedGateSession): DatabaseSession => {
  const { id, userId, expiresAt, ...attributes } = raw;
  return {
    id,
    userId,
    expiresAt,
    attributes,
  };
};

const transformIntoDatabaseUser = (raw: IcedGateUser): DatabaseUser => {
  const { id, ...attributes } = raw;
  return {
    id,
    attributes,
  };
};

export class PrismaAdapter implements Adapter {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.#prisma.icedGateSession.delete({
        where: {
          id: sessionId,
        },
      });
    } catch {
      // ignore if session id is invalid
    }
  }

  public async deleteUserSessions(userId: string): Promise<void> {
    await this.#prisma.icedGateSession.deleteMany({
      where: {
        userId,
      },
    });
  }

  public async getSessionAndUser(
    sessionId: string
  ): Promise<[session: DatabaseSession | undefined, user: DatabaseUser | undefined]> {
    const result = await this.#prisma.icedGateSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });
    if (!result) {
      return [ undefined, undefined ];
    }
    const { user: userResult, ...resultRest } = result;

    return [ transformIntoDatabaseSession(resultRest), transformIntoDatabaseUser(userResult) ];
  }

  public async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    const result = await this.#prisma.icedGateSession.findMany({
      where: {
        userId,
      },
    });
    return result.map(transformIntoDatabaseSession);
  }

  public async setSession(value: DatabaseSession): Promise<void> {
    await this.#prisma.icedGateSession.create({
      data: {
        id: value.id,
        userId: value.userId,
        expiresAt: value.expiresAt,
        ...value.attributes,
      },
    });
  }

  public async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    await this.#prisma.icedGateSession.update({
      where: {
        id: sessionId,
      },
      data: {
        expiresAt,
      },
    });
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.#prisma.icedGateSession.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });
  }
}
