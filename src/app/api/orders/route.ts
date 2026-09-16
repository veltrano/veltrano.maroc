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
import { mutateStore } from "@/lib/store";
import { deliverOrderWhatsApp } from "@/lib/whatsapp-send";

export async function POST(req: Request) {
  let body: {
    name?: string;
    phone?: string;
    city?: string;
    address?: string;
    notes?: string;
    lines?: CartLine[];
    coupon?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const city = String(body.city ?? "").trim();
  const address = String(body.address ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  if (!name || !phone || !city || !address) {
    return NextResponse.json(
      { error: "Nom, téléphone, ville et adresse sont requis." },
      { status: 400 }
    );
  }

  const sanitized = sanitizeLines(body.lines ?? []);
  if ("error" in sanitized) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const created = await mutateStore((data) => {
    const id = `VT-${Date.now().toString(36).toUpperCase()}`;
    const subtotalMad = cartSubtotal(sanitized);
    const code = String(body.coupon ?? "").trim().toUpperCase();
    let discountMad = 0;
    let appliedCoupon: string | undefined;
    if (code) {
      const coupon = data.coupons.find((c) => c.code === code && !c.usedAt);
      if (coupon && subtotalMad > 0) {
        discountMad = coupon.amountMad;
        appliedCoupon = code;
        coupon.usedAt = new Date().toISOString();
        coupon.usedOnOrderId = id;
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
    };
    data.orders = [order, ...data.orders];
    return order;
  });

  const whatsapp = await deliverOrderWhatsApp(created, orderWhatsAppMessage(created));
  const saved = await mutateStore((data) => {
    const i = data.orders.findIndex((o) => o.id === created.id);
    if (i >= 0) data.orders[i] = { ...data.orders[i], whatsapp };
    return data.orders[i] ?? { ...created, whatsapp };
  });

  return NextResponse.json({ order: saved });
}
