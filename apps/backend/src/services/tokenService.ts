import { createHash, randomBytes } from "node:crypto";
import { SignJWT } from "jose";

import { env } from "../config/env.js";
import type { UserRole } from "../domain/models.js";
import type { RefreshSessionRepository } from "../repositories/refreshSessionRepository.js";

const accessTokenTtl = "15m";
const refreshTokenTtlMs = 5 * 60 * 60 * 1000;
const secret = new TextEncoder().encode(env.JWT_SECRET);

export type AuthTokenSubject = {
  phone: string;
  role: UserRole;
  shopId?: string;
  userId: string;
};

function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export class TokenService {
  constructor(private readonly refreshSessions: RefreshSessionRepository) {}

  async createTokenPair(subject: AuthTokenSubject) {
    const accessToken = await new SignJWT({
      phone: subject.phone,
      role: subject.role,
      shopId: subject.shopId
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(subject.userId)
      .setIssuedAt()
      .setExpirationTime(accessTokenTtl)
      .sign(secret);
    const refreshToken = randomBytes(48).toString("base64url");
    const refreshTokenExpiresAt = new Date(Date.now() + refreshTokenTtlMs);

    await this.refreshSessions.createSession({
      ...subject,
      expiresAt: refreshTokenExpiresAt,
      tokenHash: hashRefreshToken(refreshToken)
    });

    return {
      accessToken,
      expiresInSeconds: 15 * 60,
      role: subject.role,
      refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
      shopId: subject.shopId,
      token: accessToken
    };
  }

  async refreshTokenPair(refreshToken: string) {
    const session = await this.refreshSessions.consumeSession(
      hashRefreshToken(refreshToken),
      new Date()
    );

    if (!session) {
      return null;
    }

    return this.createTokenPair({
      phone: session.phone,
      role: session.role,
      shopId: session.shopId,
      userId: session.userId
    });
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.refreshSessions.revokeSession(hashRefreshToken(refreshToken));
  }
}
