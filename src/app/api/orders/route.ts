import { NextResponse } from "next/server";
import { COUPON_VALUE_MAD, generateCouponCode } from "@/lib/coupon-code";
import {
  cartSubtotal,
  sanitizeLines,
  type CartLine,
  type Coupon,
  type Order,
} from "@/lib/order";
import { orderWhatsAppMessage } from "@/lib/order-message";
import { couponMessage, localeFromRequest, t, type MessageKey } from "@/lib/i18n/translate";
import { parseLocale } from "@/lib/i18n/locale";
import { redeemableCoupon } from "@/lib/coupon-redeem";
import { mutateStore } from "@/lib/store";
import { deliverOrderWhatsApp } from "@/lib/whatsapp-send";

export async function POST(req: Request) {
  const locale = localeFromRequest(req);
  let body: {
    name?: string;
    phone?: string;
    city?: string;
    address?: string;
    notes?: string;
    lines?: CartLine[];
    coupon?: string | null;
    locale?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: t(locale, "err.invalidRequest") }, { status: 400 });
  }

  const orderLocale = parseLocale(body.locale) ?? locale;
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const city = String(body.city ?? "").trim();
  const address = String(body.address ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  if (!name || !phone || !city || !address) {
    return NextResponse.json(
      { error: t(orderLocale, "checkout.required") },
      { status: 400 }
    );
  }

  const sanitized = sanitizeLines(body.lines ?? []);
  if ("error" in sanitized) {
    const key = (sanitized.errorKey as MessageKey | undefined) ?? "checkout.emptyCart";
    return NextResponse.json(
      { error: t(orderLocale, key, { slug: sanitized.slug ?? "" }) },
      { status: 400 }
    );
  }

  const created = await mutateStore((data) => {
    const code = String(body.coupon ?? "").trim();
    if (code) {
      const result = redeemableCoupon(data.coupons, data.orders, code);
      if (!result.ok) return { error: couponMessage(orderLocale, result.code) };
    }

    const id = `VT-${Date.now().toString(36).toUpperCase()}`;
    const subtotalMad = cartSubtotal(sanitized);
    let discountMad = 0;
    let appliedCoupon: string | undefined;
    if (code) {
      const result = redeemableCoupon(data.coupons, data.orders, code);
      if (!result.ok) return { error: couponMessage(orderLocale, result.code) };
      if (subtotalMad > 0) {
        discountMad = result.coupon.amountMad;
        appliedCoupon = result.coupon.code;
        result.coupon.usedAt = new Date().toISOString();
        result.coupon.usedOnOrderId = id;
      }
    }
    const used = new Set(data.coupons.map((c) => c.code));
    const reward: Coupon = {
      code: generateCouponCode(used),
      amountMad: COUPON_VALUE_MAD,
      orderId: id,
      createdAt: new Date().toISOString(),
    };
    data.coupons = [reward, ...data.coupons];
    const order: Order = {
      id,
      createdAt: new Date().toISOString(),
      name,
      phone,
      city,
      address,
      notes,
      lines: sanitized,
      subtotalMad,
      discountMad,
      totalMad: Math.max(0, subtotalMad - discountMad),
      appliedCoupon,
      rewardCoupon: reward.code,
      whatsapp: { status: "queued" },
      locale: orderLocale,
    };
    data.orders = [order, ...data.orders];
    return { order };
  });

  if ("error" in created) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  const whatsapp = await deliverOrderWhatsApp(
    created.order,
    orderWhatsAppMessage(created.order, orderLocale)
  );
  const saved = await mutateStore((data) => {
    const i = data.orders.findIndex((o) => o.id === created.order.id);
    if (i >= 0) data.orders[i] = { ...data.orders[i], whatsapp };
    return data.orders[i] ?? { ...created.order, whatsapp };
  });

  return NextResponse.json({ order: saved });
}
