import "dotenv/config";
import {
  AnalystProfile,
  OrganizationMemberRole,
} from "../../src/generated/prisma/client";
import { prisma } from "../../server/db/prisma";

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function seedOrganization(): Promise<void> {
  const organizationName = requiredEnvironmentValue("ORG_NAME");
  const adminEmail = requiredEnvironmentValue("FIRST_ADMIN_EMAIL").toLowerCase();
  const adminName = requiredEnvironmentValue("FIRST_ADMIN_NAME");
  const profileValue = requiredEnvironmentValue("FIRST_ADMIN_ANALYST_PROFILE");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    throw new Error("FIRST_ADMIN_EMAIL must be a valid email address");
  }
  if (profileValue !== "diagrammer" && profileValue !== "domain_specialist") {
    throw new Error("FIRST_ADMIN_ANALYST_PROFILE must be diagrammer or domain_specialist");
  }
  const analystProfile =
    profileValue === "diagrammer"
      ? AnalystProfile.diagrammer
      : AnalystProfile.domain_specialist;

  const organization = await prisma.organization.upsert({
    where: { id: "mhconsultancy" },
    create: { id: "mhconsultancy", name: organizationName },
    update: { name: organizationName },
  });
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      displayName: adminName,
      analystProfile,
    },
    update: {
      displayName: adminName,
      analystProfile,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: OrganizationMemberRole.org_admin,
    },
    update: { role: OrganizationMemberRole.org_admin },
  });
}

try {
  await seedOrganization();
} finally {
  await prisma.$disconnect();
}
