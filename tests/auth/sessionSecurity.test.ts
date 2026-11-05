import { afterEach, describe, expect, it, vi } from "vitest";
import { buildServer } from "../../server/app";
import { createCsrfToken } from "../../server/auth/csrf";
import { sessionCookieOptions } from "../../server/auth/session";

describe("session and request security", () => {
  const servers: Awaited<ReturnType<typeof buildServer>>[] = [];

  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close()));
    vi.unstubAllEnvs();
  });

  it("uses the required session cookie protections", () => {
    expect(sessionCookieOptions()).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  });

  it("rejects state-changing requests without a valid CSRF token", async () => {
    const server = buildServer({ csrfSecret: "test-secret-that-is-long-enough-32" });
    servers.push(server);
    const response = await server.inject({
      method: "POST",
      url: "/auth/login",
      payload: {},
    });

    expect(response.statusCode).toBe(403);
  });

  it("requires an explicit CSRF secret in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CSRF_SECRET", "");

    expect(() => buildServer()).toThrow("CSRF_SECRET is required in production");
  });

  it("rate limits repeated authentication attempts", async () => {
    const secret = "test-secret-that-is-long-enough-32";
    const server = buildServer({ csrfSecret: secret });
    servers.push(server);
    const token = createCsrfToken(secret);
    const statusCodes: number[] = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const response = await server.inject({
          method: "POST",
          url: "/auth/login",
          headers: {
            cookie: `csrf=${token}`,
            "x-csrf-token": token,
          },
          payload: {},
        });
      statusCodes.push(response.statusCode);
    }

    expect(statusCodes.at(-1)).toBe(429);
  });

  it("rejects ambiguous duplicate CSRF cookies", async () => {
    const secret = "test-secret-that-is-long-enough-32";
    const server = buildServer({ csrfSecret: secret });
    servers.push(server);
    const token = createCsrfToken(secret);
    const response = await server.inject({
      method: "POST",
      url: "/auth/login",
      headers: {
        cookie: `csrf=${token}; csrf=${token}`,
        "x-csrf-token": token,
      },
      payload: {},
    });

    expect(response.statusCode).toBe(403);
  });
});
