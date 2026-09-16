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

function existingCodes() {
  return new Set(readCoupons().map((c) => c.code));
}

export function generateCouponCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const used = existingCodes();
  for (let i = 0; i < 20; i++) {
    let tail = "";
    for (let j = 0; j < 6; j++) {
      tail += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    const code = `VT50-${tail}`;
    if (!used.has(code)) return code;
  }
  return `VT50-${Date.now().toString(36).toUpperCase()}`;
}

export function issueCoupon(orderId: string): Coupon {
  const coupon: Coupon = {
    code: generateCouponCode(),
    amountMad: COUPON_VALUE_MAD,
    orderId,
    createdAt: new Date().toISOString(),
  };
  writeCoupons([coupon, ...readCoupons()]);
  return coupon;
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
