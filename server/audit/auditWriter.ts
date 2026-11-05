import { createHash } from "node:crypto";
import { Prisma } from "../../src/generated/prisma/client";
import type { PrismaClient } from "../../src/generated/prisma/client";

export interface AuditEventInput {
  actorUserId: string;
  organizationId: string;
  projectId?: string;
  action: string;
  objectType: string;
  objectId: string;
  revisionId?: string;
}

export interface AuditEventRecord extends Omit<AuditEventInput, "projectId" | "revisionId"> {
  id: string;
  projectId: string | null;
  revisionId: string | null;
  createdAt: string;
  previousHash: string | null;
  hash: string;
}

type NewAuditEvent = Omit<AuditEventRecord, "id">;

export interface AuditTransaction {
  findLatest(organizationId: string): Promise<AuditEventRecord | null>;
  insert(event: NewAuditEvent): Promise<AuditEventRecord>;
}

export interface AuditRepository {
  transaction<T>(
    organizationId: string,
    operation: (transaction: AuditTransaction) => Promise<T>,
  ): Promise<T>;
}

function hashEvent(event: Omit<AuditEventRecord, "id" | "hash">): string {
  const canonicalEvent = [
    event.actorUserId,
    event.organizationId,
    event.projectId,
    event.action,
    event.objectType,
    event.objectId,
    event.revisionId,
    event.createdAt,
    event.previousHash,
  ];
  return createHash("sha256").update(JSON.stringify(canonicalEvent)).digest("hex");
}

export class AuditWriter {
  constructor(private readonly repository: AuditRepository) {}

  async append(input: AuditEventInput): Promise<AuditEventRecord> {
    if (
      !/^[a-z][a-z0-9._-]{1,79}$/.test(input.action) ||
      !/^[A-Za-z][A-Za-z0-9]{0,63}$/.test(input.objectType) ||
      [input.actorUserId, input.organizationId, input.projectId, input.objectId, input.revisionId]
        .some((value) => value !== undefined && !/^[A-Za-z0-9_-]{1,128}$/.test(value))
    ) {
      throw new TypeError("Audit metadata must contain identifiers, not content");
    }

    return this.repository.transaction(input.organizationId, async (transaction) => {
      const previous = await transaction.findLatest(input.organizationId);
      const unsignedEvent = {
        actorUserId: input.actorUserId,
        organizationId: input.organizationId,
        projectId: input.projectId ?? null,
        action: input.action,
        objectType: input.objectType,
        objectId: input.objectId,
        revisionId: input.revisionId ?? null,
        createdAt: new Date().toISOString(),
        previousHash: previous?.hash ?? null,
      };

      return transaction.insert({
        ...unsignedEvent,
        hash: hashEvent(unsignedEvent),
      });
    });
  }
}

export function verifyAuditChain(events: readonly AuditEventRecord[]): boolean {
  const previousHashes = new Map<string, string | null>();
  for (const event of events) {
    const unsignedEvent = {
      actorUserId: event.actorUserId,
      organizationId: event.organizationId,
      projectId: event.projectId,
      action: event.action,
      objectType: event.objectType,
      objectId: event.objectId,
      revisionId: event.revisionId,
      createdAt: event.createdAt,
      previousHash: event.previousHash,
    };
    const previousHash = previousHashes.get(event.organizationId) ?? null;
    if (event.previousHash !== previousHash || event.hash !== hashEvent(unsignedEvent)) return false;
    previousHashes.set(event.organizationId, event.hash);
  }
  return true;
}

function mapAuditEvent(row: {
  id: string;
  actorUserId: string;
  organizationId: string;
  projectId: string | null;
  action: string;
  objectType: string;
  objectId: string;
  revisionId: string | null;
  createdAt: Date;
  previousHash: string | null;
  hash: string;
}): AuditEventRecord {
  return {
    id: row.id,
    actorUserId: row.actorUserId,
    organizationId: row.organizationId,
    projectId: row.projectId,
    action: row.action,
    objectType: row.objectType,
    objectId: row.objectId,
    revisionId: row.revisionId,
    createdAt: row.createdAt.toISOString(),
    previousHash: row.previousHash,
    hash: row.hash,
  };
}

export function createPrismaAuditWriter(prisma: PrismaClient): AuditWriter {
  const repository: AuditRepository = {
    transaction: (organizationId, operation) =>
      prisma.$transaction(async (transaction) => {
        await transaction.$queryRaw(
          Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${organizationId}))`,
        );
        const tx: AuditTransaction = {
          async findLatest(organizationId) {
            const event = await transaction.auditEvent.findFirst({
              where: { organizationId },
              orderBy: { sequence: "desc" },
            });
            return event ? mapAuditEvent(event) : null;
          },
          async insert(event) {
            const created = await transaction.auditEvent.create({
              data: {
                ...event,
                createdAt: new Date(event.createdAt),
              },
            });
            return mapAuditEvent(created);
          },
        };

        return operation(tx);
      }),
  };
  return new AuditWriter(repository);
}
