import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";

describe("baseline database migration", () => {
  it("creates the baseline schema from an empty PostgreSQL database", async () => {
    const migrationsPath = join(process.cwd(), "prisma", "migrations");
    const migrationDirectories = readdirSync(migrationsPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    const database = new PGlite();

    try {
      for (const migrationDirectory of migrationDirectories) {
        const sql = readFileSync(
          join(migrationsPath, migrationDirectory, "migration.sql"),
          "utf8",
        );
        await database.exec(sql);
      }

      const result = await database.query<{ table_name: string }>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
      );
      const tables = result.rows.map((row) => row.table_name);

      expect(tables).toContain("Organization");
      expect(tables).toContain("Project");
      expect(tables).toContain("AuditEvent");

      const organizationScopedTables = await database.query<{ table_name: string }>(
        `SELECT table_name FROM information_schema.columns
         WHERE table_schema = 'public' AND column_name = 'organizationId'`,
      );
      expect(organizationScopedTables.rows.map((row) => row.table_name)).toEqual(
        expect.arrayContaining([
          "APQCCategory",
          "Project",
          "ProjectMember",
          "Subprocess",
          "ProcessActivity",
          "Device",
          "DeviceAttestation",
          "ByodAgreement",
          "Interview",
          "InterviewParticipant",
          "ConsentRecord",
          "ClientAuthorization",
          "RecordingSession",
          "RecordingGap",
          "Evidence",
          "UploadJob",
          "StructuredNote",
          "ProcessDraft",
          "DraftRevision",
          "EditLease",
          "Diagram",
          "DiagramRevision",
          "DiagramReview",
          "VerificationRun",
          "ApprovalAttachment",
          "AIJob",
          "DeletionRequest",
          "ExcelTemplate",
          "TemplateMapping",
          "InterviewGuide",
          "GuideVersion",
          "AuditEvent",
          "UsageEvent",
          "PilotMeasurement",
        ]),
      );

      await database.query(
        `INSERT INTO "Organization" ("id", "name", "updatedAt") VALUES ('org1', 'MHCONSULTANCY', NOW())`,
      );
      await database.query(
        `INSERT INTO "User" ("id", "email", "displayName", "analystProfile", "updatedAt") VALUES ('user1', 'admin@example.test', 'Admin', 'diagrammer', NOW())`,
      );
      await database.query(
        `INSERT INTO "AuditEvent" ("id", "organizationId", "actorUserId", "action", "objectType", "objectId", "hash") VALUES ('audit1', 'org1', 'user1', 'project.created', 'Project', 'project1', 'initial-hash')`,
      );

      await expect(
        database.query(`UPDATE "AuditEvent" SET "action" = 'project.deleted' WHERE "id" = 'audit1'`),
      ).rejects.toThrow("Audit events are immutable");
      await expect(
        database.query(`DELETE FROM "AuditEvent" WHERE "id" = 'audit1'`),
      ).rejects.toThrow("Audit events are immutable");
    } finally {
      await database.close();
    }
  });
});
