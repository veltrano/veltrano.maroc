import { NextResponse } from "next/server";
import { redeemableCoupon } from "@/lib/coupon-redeem";
import { readStore } from "@/lib/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params;
  const normalized = decodeURIComponent(code ?? "");
  const { coupons, orders } = await readStore();
  const result = redeemableCoupon(coupons, orders, normalized);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, used: result.used },
      { status: result.error.startsWith("Entre") ? 400 : 404 }
    );
  }
  return NextResponse.json({
    ok: true,
    code: result.coupon.code,
    amountMad: result.coupon.amountMad,
  });
}
