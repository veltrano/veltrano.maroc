import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params;
  const normalized = decodeURIComponent(code).trim().toUpperCase();
  if (!normalized) {
    return NextResponse.json({ ok: false, error: "Entre un code." }, { status: 400 });
  }
  const { coupons } = await readStore();
  const coupon = coupons.find((c) => c.code === normalized && !c.usedAt);
  if (!coupon) {
    return NextResponse.json(
      { ok: false, error: "Code invalide ou déjà utilisé." },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true, code: coupon.code, amountMad: coupon.amountMad });
}
