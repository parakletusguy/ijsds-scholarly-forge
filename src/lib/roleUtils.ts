import { Profile } from "@/types/profile";

/**
 * Centrally determines the acting role based on user flags.
 * Priority: Admin > Editor > Original Role
 */
export const getActingRoleFromProfile = (
  p: Profile | null | undefined,
): string | null => {
  if (!p) return null;

  // Handle both boolean and string "true" variants (common in some DB drivers/API responses)
  const isAdmin =
    p.is_admin === true ||
    (p.is_admin as any) === "true" ||
    (p.is_admin as any) === 1;
  const isEditor =
    p.is_editor === true ||
    (p.is_editor as any) === "true" ||
    (p.is_editor as any) === 1;

  if (isAdmin) return "admin";
  if (isEditor) return "editor";

  return p.role || "author";
};
