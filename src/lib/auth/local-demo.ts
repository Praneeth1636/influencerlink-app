const LOCAL_DEMO_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export const LOCAL_DEMO_BRAND_ID = "00000000-0000-4000-8000-000000000003";

export function isLocalDemoHost(hostname?: string | null): boolean {
  if (process.env.NODE_ENV === "production") return false;

  const value = hostname ?? (typeof window === "undefined" ? "" : window.location.hostname);

  return LOCAL_DEMO_HOSTS.has(value);
}

export function isLocalDemoRequest(headers: Headers): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.E2E_BYPASS_AUTH === "true") return true;

  const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "";
  const hostname = host.split(":")[0] ?? "";

  return isLocalDemoHost(hostname);
}
