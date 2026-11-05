import { randomBytes } from "node:crypto";
import Fastify, { type FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { verifyCsrfToken } from "./auth/csrf";
import { registerSecurityHeaders } from "./securityHeaders";

export interface BuildServerOptions {
  csrfSecret?: string;
  authRateLimitMax?: number;
}

function readCookie(requestCookie: string | undefined, cookieName: string): string | undefined {
  const matches = requestCookie
    ?.split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith(`${cookieName}=`));

  if (!matches || matches.length !== 1) return undefined;
  return matches[0].slice(cookieName.length + 1);
}

export function buildServer(options: BuildServerOptions = {}): FastifyInstance {
  const configuredCsrfSecret = options.csrfSecret ?? process.env.CSRF_SECRET;
  if (!configuredCsrfSecret && process.env.NODE_ENV === "production") {
    throw new Error("CSRF_SECRET is required in production");
  }
  if (configuredCsrfSecret !== undefined && configuredCsrfSecret.length < 32) {
    throw new Error("CSRF_SECRET must contain at least 32 characters");
  }

  const csrfSecret = configuredCsrfSecret ?? randomBytes(32).toString("base64url");
  const authRateLimitMax = options.authRateLimitMax ?? 5;
  if (!Number.isSafeInteger(authRateLimitMax) || authRateLimitMax < 1) {
    throw new RangeError("Authentication rate limit must be a positive integer");
  }

  const server = Fastify({
    logger: false,
    trustProxy: process.env.TRUSTED_PROXY ?? false,
  });

  registerSecurityHeaders(server);

  server.addHook("onRequest", async (request, reply) => {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return;

    const cookieToken = readCookie(request.headers.cookie, "csrf");
    const headerToken = request.headers["x-csrf-token"];
    if (
      typeof headerToken !== "string" ||
      !cookieToken ||
      cookieToken !== headerToken ||
      !verifyCsrfToken(csrfSecret, headerToken)
    ) {
      return reply.code(403).send({ error: "CSRF validation failed" });
    }
  });

  server.get("/health", async () => ({ status: "ok" }));
  server.register(
    async (authRoutes) => {
      await authRoutes.register(rateLimit, {
        global: true,
        max: authRateLimitMax,
        timeWindow: "15 minutes",
      });
      authRoutes.post("/login", async (_request, reply) =>
        reply.code(401).send({ error: "Authentication required" }),
      );
    },
    { prefix: "/auth" },
  );

  return server;
}
