import { describe, expect, it, vi } from "vitest";
import { ProjectAccessError, requireProjectRole } from "../../server/auth/projectAuthorization";

function createRepository(options: {
  project?: { id: string; organizationId: string } | null;
  organizationMember?: { userId: string } | null;
  projectMember?: { role: "project_admin" | "analyst" } | null;
}) {
  return {
    project: {
      findFirst: vi.fn().mockResolvedValue(options.project ?? null),
    },
    organizationMember: {
      findFirst: vi.fn().mockResolvedValue(options.organizationMember ?? null),
    },
    projectMember: {
      findFirst: vi.fn().mockResolvedValue(options.projectMember ?? null),
    },
  };
}

describe("project authorization", () => {
  it("requires organization and project membership with an allowed role", async () => {
    const repository = createRepository({
      project: { id: "p1", organizationId: "o1" },
      organizationMember: { userId: "u1" },
      projectMember: { role: "analyst" },
    });

    await expect(
      requireProjectRole(repository, "u1", "p1", ["analyst"]),
    ).resolves.toEqual({ projectId: "p1", organizationId: "o1", role: "analyst" });
  });

  it("returns the same denial for a missing project and a non-member", async () => {
    const missingProject = createRepository({ project: null });
    const nonMember = createRepository({
      project: { id: "p1", organizationId: "o1" },
      organizationMember: null,
    });
    const projectNonMember = createRepository({
      project: { id: "p1", organizationId: "o1" },
      organizationMember: { userId: "u1" },
      projectMember: null,
    });

    const results = await Promise.allSettled([
      requireProjectRole(missingProject, "u1", "missing", ["analyst"]),
      requireProjectRole(nonMember, "u1", "p1", ["analyst"]),
      requireProjectRole(projectNonMember, "u1", "p1", ["analyst"]),
    ]);

    expect(results.map((result) => {
      if (result.status === "fulfilled") return null;
      const error = result.reason as ProjectAccessError;
      return { statusCode: error.statusCode, message: error.message };
    })).toEqual([
      { statusCode: 404, message: "Project not found" },
      { statusCode: 404, message: "Project not found" },
      { statusCode: 404, message: "Project not found" },
    ]);
  });

  it("rejects roles not included in the caller's allow-list", async () => {
    const repository = createRepository({
      project: { id: "p1", organizationId: "o1" },
      organizationMember: { userId: "u1" },
      projectMember: { role: "analyst" },
    });

    await expect(
      requireProjectRole(repository, "u1", "p1", ["project_admin"]),
    ).rejects.toBeInstanceOf(ProjectAccessError);
  });
});
