import type { FastifyReply } from "fastify";

export const SESSION_COOKIE_NAME = "mapio_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function setSessionCookie(reply: FastifyReply, sessionId: string): void {
  const options = sessionCookieOptions();
  reply.header(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; Path=${options.path}; HttpOnly; Secure; SameSite=Lax; Max-Age=${options.maxAge}`,
  );
}

export function clearSessionCookie(reply: FastifyReply): void {
  const options = sessionCookieOptions();
  reply.header(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=${options.path}; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  );
}
