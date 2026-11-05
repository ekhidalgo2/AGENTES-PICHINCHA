import type { ProjectRole } from "../../src/shared/domain";

interface ProjectRecord {
  id: string;
  organizationId: string;
}

interface ProjectAccessRepository {
  project: {
    findFirst(args: {
      where: { id: string };
      select: { id: true; organizationId: true };
    }): Promise<ProjectRecord | null>;
  };
  organizationMember: {
    findFirst(args: {
      where: { organizationId: string; userId: string };
      select: { userId: true };
    }): Promise<{ userId: string } | null>;
  };
  projectMember: {
    findFirst(args: {
      where: { projectId: string; userId: string; role: { in: ProjectRole[] } };
      select: { role: true };
    }): Promise<{ role: ProjectRole } | null>;
  };
}

export class ProjectAccessError extends Error {
  readonly statusCode = 404;

  constructor() {
    super("Project not found");
    this.name = "ProjectAccessError";
  }
}

export async function requireProjectRole(
  repository: ProjectAccessRepository,
  userId: string,
  projectId: string,
  allowedRoles: ProjectRole[],
): Promise<{ projectId: string; organizationId: string; role: ProjectRole }> {
  const project = await repository.project.findFirst({
    where: { id: projectId },
    select: { id: true, organizationId: true },
  });
  if (!project) throw new ProjectAccessError();

  const organizationMember = await repository.organizationMember.findFirst({
    where: { organizationId: project.organizationId, userId },
    select: { userId: true },
  });
  if (!organizationMember) throw new ProjectAccessError();

  const projectMember = await repository.projectMember.findFirst({
    where: { projectId, userId, role: { in: allowedRoles } },
    select: { role: true },
  });
  if (!projectMember || !allowedRoles.includes(projectMember.role)) {
    throw new ProjectAccessError();
  }

  return {
    projectId: project.id,
    organizationId: project.organizationId,
    role: projectMember.role,
  };
}
