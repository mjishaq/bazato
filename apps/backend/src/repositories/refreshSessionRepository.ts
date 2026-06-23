import type { UserRole } from "../domain/models.js";

export type RefreshSessionInput = {
  expiresAt: Date;
  phone: string;
  role: UserRole;
  shopId?: string;
  tokenHash: string;
  userId: string;
};

export type RefreshSessionRecord = RefreshSessionInput & {
  id: string;
};

export interface RefreshSessionRepository {
  createSession(input: RefreshSessionInput): Promise<RefreshSessionRecord>;
  consumeSession(tokenHash: string, now: Date): Promise<RefreshSessionRecord | null>;
  revokeSession(tokenHash: string): Promise<void>;
}

const memorySessions = new Map<string, RefreshSessionRecord>();

export class MemoryRefreshSessionRepository implements RefreshSessionRepository {
  async createSession(input: RefreshSessionInput) {
    const session = {
      ...input,
      id: `refresh-${input.tokenHash.slice(0, 12)}`
    };

    memorySessions.set(input.tokenHash, session);

    return session;
  }

  async consumeSession(tokenHash: string, now: Date) {
    const session = memorySessions.get(tokenHash);
    memorySessions.delete(tokenHash);

    if (!session || session.expiresAt <= now) {
      return null;
    }

    return session;
  }

  async revokeSession(tokenHash: string) {
    memorySessions.delete(tokenHash);
  }
}
