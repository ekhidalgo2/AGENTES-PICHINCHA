import type { PrismaClient } from "../../src/generated/prisma/client";

export interface UsageEventInput {
  organizationId: string;
  projectId?: string;
  type: string;
  count?: number;
}

export async function recordUsageEvent(
  prisma: Pick<PrismaClient, "usageEvent">,
  event: UsageEventInput,
): Promise<void> {
  const count = event.count ?? 1;
  if (!Number.isSafeInteger(count) || count < 1) {
    throw new RangeError("Usage event count must be a positive safe integer");
  }

  await prisma.usageEvent.create({
    data: {
      organizationId: event.organizationId,
      projectId: event.projectId,
      type: event.type,
      count,
    },
  });
}
