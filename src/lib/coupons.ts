import { COUPON_ALREADY_USED, COUPON_EMPTY, COUPON_INVALID } from "@/lib/coupon-redeem";

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
  return c && !c.usedAt && !c.usedOnOrderId ? c : undefined;
}

export function saveIssuedCoupon(code: string, orderId: string, amountMad = COUPON_VALUE_MAD) {
  const n = code.trim().toUpperCase();
  if (!n) return;
  const existing = findCoupon(n);
  if (existing?.usedAt || existing?.usedOnOrderId) return;
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
  const existing = findCoupon(n);
  if (existing?.usedAt || existing?.usedOnOrderId) {
    setAppliedCode(null);
    return;
  }
  if (!unusedCoupon(n)) {
    saveIssuedCoupon(n, "remote", amountMad);
  }
  setAppliedCode(n);
}

export function markCouponUsed(code: string, usedOnOrderId: string) {
  const n = code.trim().toUpperCase();
  if (!n) return;
  const list = readCoupons();
  const i = list.findIndex((c) => c.code === n);
  const stamp = { usedAt: new Date().toISOString(), usedOnOrderId };
  if (i < 0) {
    writeCoupons([
      {
        code: n,
        amountMad: COUPON_VALUE_MAD,
        orderId: usedOnOrderId,
        createdAt: new Date().toISOString(),
        ...stamp,
      },
      ...list,
    ]);
    return;
  }
  writeCoupons(list.map((c, idx) => (idx === i ? { ...c, ...stamp } : c)));
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
  if (!code) return { ok: false, error: COUPON_EMPTY };
  const existing = findCoupon(code);
  if (existing?.usedAt || existing?.usedOnOrderId) {
    setAppliedCode(null);
    return { ok: false, error: COUPON_ALREADY_USED };
  }
  if (!existing) return { ok: false, error: COUPON_INVALID };
  setAppliedCode(code);
  return { ok: true, code };
}

export async function applyCouponRemote(raw: string) {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false as const, error: COUPON_EMPTY };
  try {
    const res = await fetch(`/api/coupons/${encodeURIComponent(code)}`, {
      headers: {
        "Accept-Language":
          typeof document !== "undefined" ? document.documentElement.lang || "fr" : "fr",
      },
    });
    const json = (await res.json()) as {
      ok?: boolean;
      code?: string;
      amountMad?: number;
      error?: string;
      used?: boolean;
    };
    if (res.ok && json.ok && json.code) {
      rememberValidCoupon(json.code, json.amountMad ?? COUPON_VALUE_MAD);
      return { ok: true as const, code: json.code };
    }
    if (json.used || json.error) {
      if (json.used) {
        markCouponUsed(code, "remote");
        setAppliedCode(null);
      }
    return { ok: false as const, error: json.error || COUPON_INVALID };
    }
  } catch {
    /* server unreachable: still refuse a locally used code */
  }
  const local = findCoupon(code);
  if (local?.usedAt || local?.usedOnOrderId) {
    setAppliedCode(null);
    return { ok: false as const, error: COUPON_ALREADY_USED };
  }
  return applyCouponInput(code);
}
