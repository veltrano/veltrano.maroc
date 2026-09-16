export const COUPON_VALUE_MAD = 50;

export type Coupon = {
  code: string;
  amountMad: number;
  orderId: string;
  createdAt: string;
  usedAt?: string;
  usedOnOrderId?: string;
};

const KEY = "veltrano:coupons";
const APPLIED_KEY = "veltrano:applied-coupon";

function readCoupons(): Coupon[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Coupon[];
  } catch {
    return [];
  }
}

function writeCoupons(list: Coupon[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function listCoupons() {
  return readCoupons();
}

export function findCoupon(code: string) {
  const n = code.trim().toUpperCase();
  return readCoupons().find((c) => c.code === n);
}

export function unusedCoupon(code: string) {
  const c = findCoupon(code);
  return c && !c.usedAt ? c : undefined;
}

export function saveIssuedCoupon(code: string, orderId: string, amountMad = COUPON_VALUE_MAD) {
  const n = code.trim().toUpperCase();
  if (!n) return;
  const list = readCoupons().filter((c) => c.code !== n);
  writeCoupons([
    {
      code: n,
      amountMad,
      orderId,
      createdAt: new Date().toISOString(),
    },
    ...list,
  ]);
}

export function rememberValidCoupon(code: string, amountMad = COUPON_VALUE_MAD) {
  const n = code.trim().toUpperCase();
  if (!unusedCoupon(n)) {
    saveIssuedCoupon(n, "remote", amountMad);
  }
  setAppliedCode(n);
}

export function markCouponUsed(code: string, usedOnOrderId: string) {
  const n = code.trim().toUpperCase();
  writeCoupons(
    readCoupons().map((c) =>
      c.code === n
        ? { ...c, usedAt: new Date().toISOString(), usedOnOrderId }
        : c
    )
  );
}

export function getAppliedCode() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(APPLIED_KEY);
}

export function setAppliedCode(code: string | null) {
  if (code) localStorage.setItem(APPLIED_KEY, code.trim().toUpperCase());
  else localStorage.removeItem(APPLIED_KEY);
}

export function applyCouponInput(raw: string): { ok: true; code: string } | { ok: false; error: string } {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false, error: "Entre un code." };
  const c = unusedCoupon(code);
  if (!c) return { ok: false, error: "Code invalide ou déjà utilisé." };
  setAppliedCode(code);
  return { ok: true, code };
}

export async function applyCouponRemote(raw: string) {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false as const, error: "Entre un code." };
  try {
    const res = await fetch(`/api/coupons/${encodeURIComponent(code)}`);
    const json = (await res.json()) as { ok?: boolean; code?: string; amountMad?: number; error?: string };
    if (res.ok && json.ok && json.code) {
      rememberValidCoupon(json.code, json.amountMad ?? COUPON_VALUE_MAD);
      return { ok: true as const, code: json.code };
    }
  } catch {
    /* fall through to local cache */
  }
  return applyCouponInput(code);
}
