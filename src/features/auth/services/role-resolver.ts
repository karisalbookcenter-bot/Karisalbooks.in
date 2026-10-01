import { DEFAULT_ROLE, ROLES, type Role } from "@/constants/roles.constants";

interface SupabaseRoleUser {
  email?: string;
  app_metadata?: Record<string, unknown>;
}

const VALID_ROLES = new Set<string>(Object.values(ROLES));

export function resolveServerRole(user: SupabaseRoleUser): Role {
  const email = user.email?.trim().toLowerCase();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (email && adminEmails.includes(email)) return ROLES.ADMIN;

  const metadataRole = user.app_metadata?.role;
  return typeof metadataRole === "string" && VALID_ROLES.has(metadataRole)
    ? metadataRole as Role
    : DEFAULT_ROLE;
}