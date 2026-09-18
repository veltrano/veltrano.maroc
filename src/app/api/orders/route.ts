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
import {
  newId,
  normalizeEmail,
  normalizePhone,
  type ClientProfile,
} from "@/lib/crm";

export async function POST(req: Request) {
  const locale = localeFromRequest(req);
  let body: {
    name?: string;
    phone?: string;
    email?: string;
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
  const email = normalizeEmail(body.email);
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
    const code = String(body.coupon ?? "").trim().toUpperCase();
    const fixedResult = code
      ? redeemableCoupon(data.coupons, data.orders, code)
      : null;
    const welcomeSignup = code
      ? data.emailSignups.find(
          (signup) =>
            signup.couponCode === code &&
            signup.couponStatus === "active" &&
            new Date(signup.expiresAt).getTime() > Date.now()
        )
      : undefined;
    if (code) {
      if (fixedResult && !fixedResult.ok && !welcomeSignup) {
        return { error: couponMessage(orderLocale, fixedResult.code) };
      }
    }

    const id = `VT-${Date.now().toString(36).toUpperCase()}`;
    const subtotalMad = cartSubtotal(sanitized);
    let discountMad = 0;
    let appliedCoupon: string | undefined;
    if (code) {
      if (welcomeSignup) {
        discountMad = Math.round(subtotalMad * 0.1);
        appliedCoupon = welcomeSignup.couponCode;
        welcomeSignup.couponStatus = "used";
        welcomeSignup.linkedOrderId = id;
        welcomeSignup.updatedAt = new Date().toISOString();
        data.welcomeCouponEvents.unshift({
          id: newId("WCE"),
          signupId: welcomeSignup.id,
          fromStatus: "active",
          toStatus: "used",
          reason: `Utilisé sur ${id}`,
          createdAt: new Date().toISOString(),
        });
      } else if (fixedResult?.ok && subtotalMad > 0) {
        discountMad = fixedResult.coupon.amountMad;
        appliedCoupon = fixedResult.coupon.code;
        fixedResult.coupon.usedAt = new Date().toISOString();
        fixedResult.coupon.usedOnOrderId = id;
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
      email: email || undefined,
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
      confirmationStatus: "new",
      shipmentStatus: "unfulfilled",
      paymentStatus: "pending",
      updatedAt: new Date().toISOString(),
    };
    data.orders = [order, ...data.orders];

    const normalizedPhone = normalizePhone(phone);
    let client =
      (email
        ? data.clients.find((item) => item.emailNormalized === email)
        : undefined) ??
      data.clients.find((item) => item.phoneNormalized === normalizedPhone);
    if (!client) {
      const stamp = new Date().toISOString();
      client = {
        id: newId("CL"),
        name,
        phone,
        phoneNormalized: normalizedPhone,
        email: email || undefined,
        emailNormalized: email || undefined,
        city,
        deliveryAddress: address,
        preferredLanguage: orderLocale,
        source: "site_web",
        notes: "",
        contactStatus: "a_contacter",
        marketingEmail: false,
        marketingWhatsApp: false,
        createdAt: stamp,
        updatedAt: stamp,
      } satisfies ClientProfile;
      data.clients.unshift(client);
    } else {
      client.name = name;
      client.phone = phone;
      client.phoneNormalized = normalizedPhone;
      if (email) {
        client.email = email;
        client.emailNormalized = email;
      }
      client.city = city;
      client.deliveryAddress = address;
      client.updatedAt = new Date().toISOString();
    }
    data.orderClientLinks.push({
      orderId: id,
      clientId: client.id,
      linkedAt: new Date().toISOString(),
    });
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
