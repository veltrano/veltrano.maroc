const KEY = "veltrano:emails";
const INTEREST_KEY = "veltrano:launch-interest";

export type LaunchInterest = "femme" | "enfant";

type InterestRecord = {
  email: string;
  interests: LaunchInterest[];
  locales: ("fr" | "ar")[];
  updatedAt: string;
};

export function saveEmail(email: string) {
  if (typeof window === "undefined") return;
  const next = email.trim().toLowerCase();
  if (!next) return;
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
    if (!list.includes(next)) list.push(next);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    localStorage.setItem(KEY, JSON.stringify([next]));
  }
}

/** Persist launch interest without overwriting the other collection. */
export function saveLaunchInterest(
  email: string,
  interest: LaunchInterest,
  locale: "fr" | "ar"
) {
  if (typeof window === "undefined") return { ok: false as const };
  const next = email.trim().toLowerCase();
  if (!next || !next.includes("@")) return { ok: false as const };
  saveEmail(next);
  try {
    const raw = JSON.parse(localStorage.getItem(INTEREST_KEY) ?? "[]") as InterestRecord[];
    const list = Array.isArray(raw) ? raw : [];
    const existing = list.find((r) => r.email === next);
    if (existing) {
      if (!existing.interests.includes(interest)) existing.interests.push(interest);
      if (!existing.locales.includes(locale)) existing.locales.push(locale);
      existing.updatedAt = new Date().toISOString();
    } else {
      list.push({
        email: next,
        interests: [interest],
        locales: [locale],
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(INTEREST_KEY, JSON.stringify(list));
    return { ok: true as const };
  } catch {
    localStorage.setItem(
      INTEREST_KEY,
      JSON.stringify([
        {
          email: next,
          interests: [interest],
          locales: [locale],
          updatedAt: new Date().toISOString(),
        },
      ])
    );
    return { ok: true as const };
  }
}
