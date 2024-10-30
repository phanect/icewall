import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { PrismaClient, type User, type Session } from "@prisma/client";

export type SessionValidationResult = {
  session?: Session;
  user?: User;
};

const prisma = new PrismaClient();

export const generateSessionToken = (): string => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);

  return encodeBase32LowerCaseNoPadding(bytes);
};

export const createSession = async (
  userId: number,
  token: string = generateSessionToken(),
): Promise<Session> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(
      Date.now() + 1000 /* ms */ * 60 /* secs */ * 60 /* mins */ * 24 /* hours */ * 30 /* days */
    ),
  };

  await prisma.session.create({
    data: session,
  });

  return session;
};

export const validateSessionToken = async (token: string): Promise<SessionValidationResult> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });

  if (!result) {
    return {};
  }

  const { user, ...session } = result;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: sessionId }});
    return {};
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        expiresAt: session.expiresAt,
      },
    });
  }

  return {
    session,
    user,
  };
};

export const invalidateSession = async (sessionId: string): Promise<void> => {
  prisma.session.delete({ where: { id: sessionId }});
};
