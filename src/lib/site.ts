export const CANONICAL_SITE_URL = "https://veltrano.ma";

export const PRODUCTION_ORIGINS = [
  "https://veltrano.ma",
  "https://www.veltrano.ma",
] as const;

const LOCAL_ORIGINS = [
  "http://127.0.0.1:43127",
  "http://localhost:43127",
];

export function siteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    CANONICAL_SITE_URL;
  return raw.replace(/\/$/, "");
}

export function allowedOrigins() {
  const extra = (process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return new Set<string>([
    ...PRODUCTION_ORIGINS,
    siteUrl(),
    ...LOCAL_ORIGINS,
    ...extra,
  ]);
}

export function corsHeaders(origin: string | null) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, x-admin-secret");
  headers.set("Access-Control-Max-Age", "86400");
  if (origin && allowedOrigins().has(origin.replace(/\/$/, ""))) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return headers;
}
