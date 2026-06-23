import { prisma } from "../db/prisma.js";
import type { UserRole } from "../domain/models.js";
import type {
  RefreshSessionInput,
  RefreshSessionRepository
} from "./refreshSessionRepository.js";

const roleToPrisma = {
  admin: "ADMIN",
  customer: "CUSTOMER",
  vendor: "VENDOR"
} as const;

const roleFromPrisma = Object.fromEntries(
  Object.entries(roleToPrisma).map(([api, db]) => [db, api])
) as Record<string, UserRole>;

export class PrismaRefreshSessionRepository implements RefreshSessionRepository {
  async createSession(input: RefreshSessionInput) {
    const user = await prisma.user.upsert({
      where: { keycloakSubject: input.userId },
      update: {
        phone: input.phone,
        role: roleToPrisma[input.role]
      },
      create: {
        keycloakSubject: input.userId,
        phone: input.phone,
        role: roleToPrisma[input.role]
      }
    });
    const session = await prisma.refreshSession.create({
      data: {
        expiresAt: input.expiresAt,
        role: roleToPrisma[input.role],
        shopId: input.shopId,
        tokenHash: input.tokenHash,
        userId: user.id
      }
    });

    return {
      id: session.id,
      expiresAt: session.expiresAt,
      phone: input.phone,
      role: roleFromPrisma[session.role],
      shopId: session.shopId ?? undefined,
      tokenHash: session.tokenHash,
      userId: input.userId
    };
  }

  async consumeSession(tokenHash: string, now: Date) {
    const session = await prisma.refreshSession.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (session) {
      await prisma.refreshSession.delete({
        where: { tokenHash }
      });
    }

    if (!session || session.expiresAt <= now) {
      return null;
    }

    return {
      id: session.id,
      expiresAt: session.expiresAt,
      phone: session.user.phone,
      role: roleFromPrisma[session.role],
      shopId: session.shopId ?? undefined,
      tokenHash: session.tokenHash,
      userId: session.user.keycloakSubject
    };
  }

  async revokeSession(tokenHash: string) {
    await prisma.refreshSession.deleteMany({
      where: { tokenHash }
    });
  }
}
