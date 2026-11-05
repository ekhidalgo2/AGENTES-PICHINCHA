import { afterEach, describe, expect, it } from "vitest";
import { buildServer } from "../../server/app";

describe("health endpoint", () => {
  const servers: Awaited<ReturnType<typeof buildServer>>[] = [];

  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close()));
  });

  it("reports the service as ready", async () => {
    const server = buildServer();
    servers.push(server);
    const response = await server.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
    expect(response.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(response.headers["x-frame-options"]).toBe("DENY");
  });
});
