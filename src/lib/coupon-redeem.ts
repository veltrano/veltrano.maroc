import type { Coupon, Order } from "@/lib/order";

export type CouponErrorCode = "empty" | "invalid" | "used";

export const COUPON_ALREADY_USED =
  "Ce code a déjà été utilisé. Il n’est valable que pour un achat.";
export const COUPON_INVALID = "Code invalide ou déjà utilisé.";
export const COUPON_EMPTY = "Entre un code.";

export function couponErrorCodeFromMessage(error: string): CouponErrorCode {
  if (error === COUPON_EMPTY || error.startsWith("Entre")) return "empty";
  if (error === COUPON_ALREADY_USED) return "used";
  return "invalid";
}

export function normalizeCouponCode(raw: string) {
  return raw.trim().toUpperCase();
}

export function couponAlreadyRedeemed(coupon: Coupon, orders: Order[]) {
  if (coupon.usedAt || coupon.usedOnOrderId) return true;
  return orders.some((o) => o.appliedCoupon === coupon.code);
}

export function redeemableCoupon(
  coupons: Coupon[],
  orders: Order[],
  raw: string
):
  | { ok: true; coupon: Coupon }
  | { ok: false; error: string; code: CouponErrorCode; used: boolean } {
  const code = normalizeCouponCode(raw);
  if (!code) return { ok: false, error: COUPON_EMPTY, code: "empty", used: false };
  const coupon = coupons.find((c) => c.code === code);
  if (!coupon) return { ok: false, error: COUPON_INVALID, code: "invalid", used: false };
  if (couponAlreadyRedeemed(coupon, orders)) {
    return { ok: false, error: COUPON_ALREADY_USED, code: "used", used: true };
  }
  return { ok: true, coupon };
}
