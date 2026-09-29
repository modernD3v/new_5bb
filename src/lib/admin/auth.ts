/**
 * Stopgap admin gate until Auth.js roles land (docs/PLAN.md §15): HTTP Basic
 * auth against ADMIN_PASSWORD (any username). With no ADMIN_PASSWORD set,
 * /admin does not exist. Edge/Node safe (no node:crypto).
 */

export const ADMIN_REALM = "5BB admin";

export function getAdminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  return pw && pw.length > 0 ? pw : null;
}

function constantTimeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function isAuthorizedAdmin(
  authorizationHeader: string | null,
  password: string | null = getAdminPassword(),
): boolean {
  if (!password || !authorizationHeader) return false;
  const [scheme, encoded] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "basic" || !encoded) return false;
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }
  const sep = decoded.indexOf(":");
  if (sep < 0) return false;
  return constantTimeEqual(decoded.slice(sep + 1), password);
}
