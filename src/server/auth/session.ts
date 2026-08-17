import "server-only";

import { randomUUID } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import type { UserRole } from "@/generated/prisma/enums";

const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-sala-cheia-session"
    : "sala-cheia-session";
const SESSION_ISSUER = "sala-cheia";
const SESSION_AUDIENCE = "sala-cheia-web";
const DEFAULT_SESSION_SECONDS = 60 * 60 * 8;
const REMEMBERED_SESSION_SECONDS = 60 * 60 * 24 * 30;
const VALID_ROLES = new Set<UserRole>([
  "ORGANIZER",
  "CUSTOMER",
  "GATEKEEPER",
]);

export type Session = {
  userId: string;
  role: UserRole;
  expiresAt: Date;
};

export function assertSessionConfiguration() {
  getSessionSecret();
}

export async function createSession(
  user: { id: string; role: UserRole },
  remember = false,
) {
  const maxAge = remember
    ? REMEMBERED_SESSION_SECONDS
    : DEFAULT_SESSION_SECONDS;
  const expiresAt = new Date(Date.now() + maxAge * 1000);
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(getSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    maxAge,
    priority: "high",
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
      requiredClaims: ["sub", "role", "exp", "iat", "jti"],
    });

    if (
      !payload.sub ||
      typeof payload.role !== "string" ||
      !VALID_ROLES.has(payload.role as UserRole) ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    return {
      userId: payload.sub,
      role: payload.role as UserRole,
      expiresAt: new Date(payload.exp * 1000),
    };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || new TextEncoder().encode(secret).byteLength < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 bytes.");
  }

  return new TextEncoder().encode(secret);
}
