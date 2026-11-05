import type { FastifyInstance } from "fastify";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
].join("; ");

export function registerSecurityHeaders(server: FastifyInstance): void {
  server.addHook("onSend", async (request, reply, payload) => {
    reply
      .header("Content-Security-Policy", CONTENT_SECURITY_POLICY)
      .header("X-Content-Type-Options", "nosniff")
      .header("X-Frame-Options", "DENY")
      .header("Referrer-Policy", "strict-origin-when-cross-origin")
      .header("Permissions-Policy", "camera=(), geolocation=(), payment=()");

    if (request.protocol === "https") {
      reply.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    return payload;
  });
}
