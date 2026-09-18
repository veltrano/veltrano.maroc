import { NextResponse } from "next/server";
import { couponMessage, localeFromRequest } from "@/lib/i18n/translate";
import { redeemableCoupon } from "@/lib/coupon-redeem";
import { readStore } from "@/lib/store";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const locale = localeFromRequest(req);
  const { code } = await ctx.params;
  const normalized = decodeURIComponent(code ?? "");
  const { coupons, orders, emailSignups } = await readStore();
  const result = redeemableCoupon(coupons, orders, normalized);
  if (!result.ok) {
    const welcome = emailSignups.find(
      (signup) =>
        signup.couponCode === normalized.trim().toUpperCase() &&
        signup.couponStatus === "active" &&
        new Date(signup.expiresAt).getTime() > Date.now()
    );
    if (welcome) {
      return NextResponse.json({
        ok: true,
        code: welcome.couponCode,
        percent: 10,
      });
    }
    return NextResponse.json(
      { ok: false, error: couponMessage(locale, result.code), code: result.code, used: result.used },
      { status: result.code === "empty" ? 400 : 404 }
    );
  }
  return NextResponse.json({
    ok: true,
    code: result.coupon.code,
    amountMad: result.coupon.amountMad,
  });
}
