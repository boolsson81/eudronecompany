/**
 * Frontend Supabase configuration — reads only VITE_* env vars at build time.
 * Target project: jzqgwsryxmgzcbjjddic.
 */

const TARGET_PROJECT_REF = "jzqgwsryxmgzcbjjddic";
const TARGET_SUPABASE_HOST = `${TARGET_PROJECT_REF}.supabase.co`;

export interface SupabaseFrontendEnv {
  url: string;
  publishableKey: string;
  projectId: string | undefined;
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function assertConfigured(value: string, name: string, minLength = 8): void {
  if (!value || value.trim().length < minLength) {
    throw new Error(`${name} is not configured`);
  }
}

function decodeJwtRef(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.ref === "string" ? payload.ref : null;
  } catch {
    return null;
  }
}

function assertTargetProject(url: string, projectId: string | undefined, key: string): void {
  // Migration governance: frontend cutover to TARGET_PROJECT_REF is currently NO-GO.
  // Do NOT throw on project mismatch — that hard-kills the SPA when Lovable Cloud is still
  // bound to the source project. Log a single warning so the split-brain is observable.
  const mismatches: string[] = [];
  if (!url.includes(TARGET_SUPABASE_HOST)) {
    mismatches.push(`url=${url}`);
  }
  if (projectId && projectId !== TARGET_PROJECT_REF) {
    mismatches.push(`projectId=${projectId}`);
  }
  const jwtRef = key.startsWith("eyJ") ? decodeJwtRef(key) : null;
  if (jwtRef && jwtRef !== TARGET_PROJECT_REF) {
    mismatches.push(`jwtRef=${jwtRef}`);
  }
  if (mismatches.length && typeof console !== "undefined") {
    console.warn(
      `[supabaseEnv] Frontend not yet on target project ${TARGET_PROJECT_REF} (${mismatches.join(", ")}). ` +
        `Continuing on the currently configured project — migration cutover pending.`,
    );
  }
}

export function getSupabaseFrontendEnv(): SupabaseFrontendEnv {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const publishableKey = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
  ) as string | undefined;
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;

  if (!url) {
    throw new Error("VITE_SUPABASE_URL is not configured");
  }
  if (!publishableKey) {
    throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY is required");
  }

  assertConfigured(url, "VITE_SUPABASE_URL", 20);
  assertConfigured(publishableKey, "VITE_SUPABASE_PUBLISHABLE_KEY", 20);
  assertTargetProject(url, projectId, publishableKey);

  return {
    url: normalizeUrl(url),
    publishableKey,
    projectId,
  };
}

export const TARGET_SUPABASE_PROJECT_REF = TARGET_PROJECT_REF;
