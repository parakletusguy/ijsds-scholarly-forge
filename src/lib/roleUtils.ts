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

const truthy = (v: unknown) => v === true || v === "true" || v === 1;

/** Same rules as the backend's authorize()/isStaffUser: the role string OR the flag counts. */
export const isAdminUser = (p: Profile | null | undefined) => !!p && (truthy(p.is_admin) || p.role === "admin");
export const isEditorUser = (p: Profile | null | undefined) =>
  !!p && (isAdminUser(p) || truthy(p.is_editor) || p.role === "editor");
export const isReviewerUser = (p: Profile | null | undefined) =>
  !!p && (isEditorUser(p) || truthy(p.is_reviewer) || p.role === "reviewer");
