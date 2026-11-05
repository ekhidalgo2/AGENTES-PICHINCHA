export type ReviewStatus = "proposed" | "confirmed" | "pending";
export type DataOrigin = "internal" | "simulated" | "client_authorized";
export type AnalystProfile = "diagrammer" | "domain_specialist";
export type ComplexityLevel = "simple" | "medium" | "complex";
export type RecordingOrigin = "pwa_laptop" | "phone_external" | "other_external";
export type OrganizationRole = "org_admin" | "member";
export type ProjectRole = "project_admin" | "analyst";

export interface SourceRef {
  evidenceId: string;
  startMs?: number;
  endMs?: number;
  quote?: string;
}

export interface ProcessProject {
  id: string;
  organizationId: string;
  name: string;
  dataOrigin: DataOrigin;
  complexityInitial: ComplexityLevel;
  complexityFinal: ComplexityLevel;
}

export interface Subprocess {
  id: string;
  projectId: string;
  name: string;
  order: number;
}

export interface ProcessActivity {
  id: string;
  projectId: string;
  subprocessId?: string;
  name: string;
  order: number;
  status: ReviewStatus;
}

export interface PainPoint {
  id: string;
  projectId: string;
  description: string;
  status: ReviewStatus;
  sources: SourceRef[];
}

export interface ComplexityInput {
  activities: number;
  roles: number;
  areas: number;
  hasSubprocesses: boolean;
}

export function classifyComplexity({
  activities,
  roles,
  areas,
  hasSubprocesses,
}: ComplexityInput): ComplexityLevel {
  if (
    !Number.isInteger(activities) ||
    !Number.isInteger(roles) ||
    !Number.isInteger(areas) ||
    activities < 0 ||
    roles < 0 ||
    areas < 0
  ) {
    throw new RangeError("Complexity counts must be non-negative integers");
  }

  if (activities > 30 || roles >= 7 || areas >= 4 || hasSubprocesses) {
    return "complex";
  }
  if (activities > 20 || roles >= 4 || areas >= 2) {
    return "medium";
  }
  return "simple";
}
