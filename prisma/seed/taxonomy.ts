import { readFile } from "node:fs/promises";
import "dotenv/config";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { prisma } from "../../server/db/prisma";

interface TaxonomyCategory {
  code: string;
  name: string;
  level: number;
}

interface TaxonomySource {
  source: string;
  version: string;
  categories: TaxonomyCategory[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTaxonomy(value: unknown): TaxonomySource {
  if (!isRecord(value) || typeof value.source !== "string" || typeof value.version !== "string") {
    throw new Error("Taxonomy file must declare a source, version, and category list");
  }
  if (!Array.isArray(value.categories) || value.categories.length === 0) {
    throw new Error("Taxonomy file must contain at least one category");
  }

  const categories = value.categories.map((entry): TaxonomyCategory => {
    if (
      !isRecord(entry) ||
      typeof entry.code !== "string" ||
      typeof entry.name !== "string" ||
      typeof entry.level !== "number" ||
      !Number.isInteger(entry.level) ||
      entry.level < 1
    ) {
      throw new Error("Each taxonomy category needs a code, name, and positive integer level");
    }

    return {
      code: entry.code.trim(),
      name: entry.name.trim(),
      level: entry.level,
    };
  });

  if (
    !value.source.trim() ||
    !value.version.trim() ||
    categories.some((category) => !category.code || !category.name)
  ) {
    throw new Error("Taxonomy source, version, codes, and names must not be empty");
  }
  if (new Set(categories.map((category) => category.code)).size !== categories.length) {
    throw new Error("Taxonomy category codes must be unique within a version");
  }

  return { source: value.source.trim(), version: value.version.trim(), categories };
}

export async function seedTaxonomy(
  prisma: PrismaClient,
  organizationId: string,
  taxonomyPath: string,
): Promise<number> {
  const file = await readFile(taxonomyPath, "utf8");
  const parsed: unknown = JSON.parse(file);
  const taxonomy = parseTaxonomy(parsed);

  await prisma.$transaction(async (transaction) => {
    for (const category of taxonomy.categories) {
      await transaction.aPQCCategory.upsert({
        where: {
          organizationId_source_version_code: {
            organizationId,
            source: taxonomy.source,
            version: taxonomy.version,
            code: category.code,
          },
        },
        create: {
          organizationId,
          source: taxonomy.source,
          version: taxonomy.version,
          ...category,
        },
        update: {
          name: category.name,
          level: category.level,
        },
      });
    }
  });

  return taxonomy.categories.length;
}

const organizationId = process.env.TAXONOMY_ORGANIZATION_ID?.trim();
const taxonomyPath = process.env.APQC_TAXONOMY_FILE?.trim();

if (!organizationId || !taxonomyPath) {
  throw new Error("Set TAXONOMY_ORGANIZATION_ID and APQC_TAXONOMY_FILE before seeding");
}

try {
  const count = await seedTaxonomy(prisma, organizationId, taxonomyPath);
  console.info(`Loaded ${count} taxonomy categories for organization ${organizationId}`);
} finally {
  await prisma.$disconnect();
}
