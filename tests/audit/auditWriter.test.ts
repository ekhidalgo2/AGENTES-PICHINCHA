import { describe, expect, it } from "vitest";
import {
  AuditWriter,
  verifyAuditChain,
  type AuditEventRecord,
  type AuditTransaction,
} from "../../server/audit/auditWriter";

function createMemoryRepository() {
  const events: AuditEventRecord[] = [];
  let nextId = 1;
  const transaction: AuditTransaction = {
    async findLatest() {
      return events.at(-1) ?? null;
    },
    async insert(event) {
      const record = { ...event, id: `audit-${nextId++}` };
      events.push(record);
      return record;
    },
  };
  return {
    events,
    repository: {
      async transaction<T>(
        _organizationId: string,
        operation: (tx: AuditTransaction) => Promise<T>,
      ) {
        return operation(transaction);
      },
    },
  };
}

describe("append-only audit trail", () => {
  it("writes chained hashes without exposing update or delete operations", async () => {
    const { events, repository } = createMemoryRepository();
    const writer = new AuditWriter(repository);

    await writer.append({
      actorUserId: "u1",
      organizationId: "o1",
      projectId: "p1",
      action: "project.created",
      objectType: "Project",
      objectId: "p1",
    });
    await writer.append({
      actorUserId: "u1",
      organizationId: "o1",
      projectId: "p1",
      action: "evidence.uploaded",
      objectType: "Evidence",
      objectId: "e1",
    });

    expect(events[1].previousHash).toBe(events[0].hash);
    expect(verifyAuditChain(events)).toBe(true);
    expect(writer).not.toHaveProperty("update");
    expect(writer).not.toHaveProperty("delete");
  });

  it("detects tampering with an earlier event", async () => {
    const { events, repository } = createMemoryRepository();
    const writer = new AuditWriter(repository);

    await writer.append({
      actorUserId: "u1",
      organizationId: "o1",
      action: "project.created",
      objectType: "Project",
      objectId: "p1",
    });
    events[0].action = "project.deleted";

    expect(verifyAuditChain(events)).toBe(false);
  });

  it("rejects content-like values in audit metadata", async () => {
    const { repository } = createMemoryRepository();
    const writer = new AuditWriter(repository);

    await expect(
      writer.append({
        actorUserId: "u1",
        organizationId: "o1",
        action: "evidence.viewed",
        objectType: "Evidence",
        objectId: "transcript text must not be logged",
      }),
    ).rejects.toThrow("Audit metadata must contain identifiers, not content");
  });
});
