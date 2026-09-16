const KEY = "veltrano:emails";

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
