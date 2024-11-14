import type { Session, User } from "@prisma/client";
import type {
  Adapter,
  DatabaseSession,
  DatabaseUser,
} from "./database.ts";

const transformIntoDatabaseSession = (raw: Session): DatabaseSession => {
  const { id, userId, expiresAt, ...attributes } = raw;
  return {
    id,
    userId,
    expiresAt,
    attributes,
  };
};

const transformIntoDatabaseUser = (raw: User): DatabaseUser => {
  const { id, ...attributes } = raw;
  return {
    id,
    attributes,
  };
};

export class PrismaAdapter implements Adapter {
  private sessionModel: PrismaModel<Session>;
  private userModel: PrismaModel<User>;

  constructor(sessionModel: BasicPrismaModel, userModel: BasicPrismaModel) {
    this.sessionModel = sessionModel as any as PrismaModel<Session>;
    this.userModel = userModel as any as PrismaModel<User>;
  }

  public async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.sessionModel.delete({
        where: {
          id: sessionId,
        },
      });
    } catch {
      // ignore if session id is invalid
    }
  }

  public async deleteUserSessions(userId: string): Promise<void> {
    await this.sessionModel.deleteMany({
      where: {
        userId,
      },
    });
  }

  public async getSessionAndUser(
    sessionId: string
  ): Promise<[session: DatabaseSession | undefined, user: DatabaseUser | undefined]> {
    const userModelKey = this.userModel.name[0].toLowerCase() + this.userModel.name.slice(1);
    const result = await this.sessionModel.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        [userModelKey]: true,
      },
    });
    if (!result) {
      return [ undefined, undefined ];
    }
    const userResult: User = result[
      userModelKey as keyof typeof result
    ] as any as User;
    delete result[userModelKey as keyof typeof result];
    return [ transformIntoDatabaseSession(result), transformIntoDatabaseUser(userResult) ];
  }

  public async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    const result = await this.sessionModel.findMany({
      where: {
        userId,
      },
    });
    return result.map(transformIntoDatabaseSession);
  }

  public async setSession(value: DatabaseSession): Promise<void> {
    await this.sessionModel.create({
      data: {
        id: value.id,
        userId: value.userId,
        expiresAt: value.expiresAt,
        ...value.attributes,
      },
    });
  }

  public async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    await this.sessionModel.update({
      where: {
        id: sessionId,
      },
      data: {
        expiresAt,
      },
    });
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.sessionModel.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });
  }
}

type BasicPrismaModel = {
  fields: any;
  findUnique: any;
  findMany: any;
};

type PrismaWhere<_Schema extends {}> = {
  [K in keyof _Schema]?:
    | _Schema[K]
    | {
      lte?: _Schema[K];
    };
};

type PrismaModel<_Schema extends {}> = {
  name: string;
  findUnique: <_Included = {}>(options: {
    where: PrismaWhere<_Schema>;
    include?: Record<string, boolean>;
  }) => Promise<null | (_Schema & _Included)>;
  findMany: (options?: { where: PrismaWhere<_Schema>; }) => Promise<_Schema[]>;
  create: (options: { data: _Schema; }) => Promise<_Schema>;
  delete: (options: { where: PrismaWhere<_Schema>; }) => Promise<void>;
  deleteMany: (options?: { where: PrismaWhere<_Schema>; }) => Promise<void>;
  update: (options: { data: Partial<_Schema>; where: PrismaWhere<_Schema>; }) => Promise<_Schema>;
};
