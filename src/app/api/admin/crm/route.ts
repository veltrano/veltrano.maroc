import { NextResponse } from "next/server";
import { adminAuthorized } from "@/lib/admin-auth";
import {
  applyContactAttempt,
  findDuplicateClients,
  newId,
  normalizeEmail,
  normalizePhone,
  type ClientProfile,
  type ClientSource,
  type ContactOutcome,
  type SavedListKey,
} from "@/lib/crm";
import { mutateStore } from "@/lib/store";
import { sendWelcomeCouponEmail } from "@/lib/welcome-email";
import { packPrice, productBySlug } from "@/data/catalog";
import { generateCouponCode } from "@/lib/coupon-code";
import type { Order } from "@/lib/order";

function unauthorized() {
  return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
}

export async function GET(req: Request) {
  if (!adminAuthorized(req)) return unauthorized();
  const url = new URL(req.url);

  const data = await mutateStore((store) => {
    for (const order of store.orders) {
      if (store.orderClientLinks.some((link) => link.orderId === order.id)) continue;
      const email = normalizeEmail(order.email);
      const phone = normalizePhone(order.phone);
      let client =
        (email
          ? store.clients.find((item) => item.emailNormalized === email)
          : undefined) ??
        (phone
          ? store.clients.find((item) => item.phoneNormalized === phone)
          : undefined);
      if (!client) {
        const stamp = order.createdAt;
        client = {
          id: newId("CL"),
          name: order.name,
          phone: order.phone,
          phoneNormalized: phone || undefined,
          email: email || undefined,
          emailNormalized: email || undefined,
          city: order.city,
          deliveryAddress: order.address,
          preferredLanguage: order.locale === "ar" ? "ar" : "fr",
          source: "site_web",
          notes: "",
          contactStatus: "a_contacter",
          marketingEmail: false,
          marketingWhatsApp: false,
          createdAt: stamp,
          updatedAt: new Date().toISOString(),
        };
        store.clients.unshift(client);
      }
      store.orderClientLinks.push({
        orderId: order.id,
        clientId: client.id,
        linkedAt: new Date().toISOString(),
      });
    }
    return store;
  });

  if (url.searchParams.has("duplicates")) {
    const duplicates = findDuplicateClients(
      data.clients.filter((client) => !client.archivedAt),
      url.searchParams.get("phone") ?? undefined,
      url.searchParams.get("email") ?? undefined
    );
    return NextResponse.json({ duplicates });
  }

  return NextResponse.json({
    clients: data.clients.filter((client) => !client.archivedAt),
    orderClientLinks: data.orderClientLinks,
    orders: data.orders,
    contactAttempts: data.contactAttempts,
    exchanges: data.exchanges,
    clientNotes: data.clientNotes,
    savedListPins: data.savedListPins,
    emailSignups: data.emailSignups,
    welcomeCouponEvents: data.welcomeCouponEvents,
    staff: data.staff.filter((member) => member.active),
    generatedAt: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  if (!adminAuthorized(req)) return unauthorized();
  const body = (await req.json().catch(() => null)) as {
    action?: string;
    force?: boolean;
    clientId?: string;
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    deliveryAddress?: string;
    preferredLanguage?: "fr" | "ar";
    source?: ClientSource;
    notes?: string;
    assignedStaffId?: string;
    nextCallbackAt?: string;
    marketingEmail?: boolean;
    marketingWhatsApp?: boolean;
    outcome?: ContactOutcome;
    listKey?: SavedListKey;
    signupId?: string;
    exchangeDescription?: string;
    orderId?: string;
    slug?: string;
    pack?: "single" | "duo";
    size?: string;
    sizeB?: string;
    quantity?: number;
  } | null;

  if (!body?.action) {
    return NextResponse.json({ error: "Action requise." }, { status: 400 });
  }

  if (body.action === "create_client") {
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = normalizeEmail(body.email);
    if (!name || (!phone && !email)) {
      return NextResponse.json(
        { error: "Nom et au moins un téléphone ou e-mail sont requis." },
        { status: 400 }
      );
    }
    const result = await mutateStore((data) => {
      const duplicates = findDuplicateClients(data.clients, phone, email);
      if (duplicates.length && !body.force) return { duplicates };
      const stamp = new Date().toISOString();
      const client: ClientProfile = {
        id: newId("CL"),
        name,
        phone: phone || undefined,
        phoneNormalized: normalizePhone(phone) || undefined,
        email: email || undefined,
        emailNormalized: email || undefined,
        city: String(body.city ?? "").trim() || undefined,
        deliveryAddress:
          String(body.deliveryAddress ?? "").trim() || undefined,
        preferredLanguage: body.preferredLanguage === "ar" ? "ar" : "fr",
        source: body.source ?? "manuel",
        notes: String(body.notes ?? "").trim(),
        assignedStaffId: body.assignedStaffId || undefined,
        nextCallbackAt: body.nextCallbackAt || undefined,
        contactStatus: "a_contacter",
        marketingEmail: body.marketingEmail === true,
        marketingWhatsApp: body.marketingWhatsApp === true,
        createdAt: stamp,
        updatedAt: stamp,
      };
      data.clients.unshift(client);
      return { client };
    });
    if ("duplicates" in result) {
      return NextResponse.json(
        { duplicateWarning: true, duplicates: result.duplicates },
        { status: 409 }
      );
    }
    return NextResponse.json(result, { status: 201 });
  }

  if (body.action === "contact_attempt") {
    if (!body.clientId || !body.outcome) {
      return NextResponse.json(
        { error: "Client et résultat requis." },
        { status: 400 }
      );
    }
    const result = await mutateStore((data) => {
      const client = data.clients.find((item) => item.id === body.clientId);
      if (!client) return null;
      const stamp = new Date().toISOString();
      const attempt = {
        id: newId("CA"),
        clientId: client.id,
        outcome: body.outcome!,
        notes: String(body.notes ?? "").trim(),
        nextCallbackAt:
          body.outcome === "contacte" ? undefined : body.nextCallbackAt,
        staffId: body.assignedStaffId || client.assignedStaffId,
        createdAt: stamp,
      };
      data.contactAttempts.unshift(attempt);
      Object.assign(
        client,
        applyContactAttempt(client, body.outcome!, attempt.nextCallbackAt)
      );
      return { client, attempt };
    });
    if (!result) {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }
    return NextResponse.json(result, { status: 201 });
  }

  if (body.action === "toggle_pin") {
    if (!body.clientId || !body.listKey) {
      return NextResponse.json(
        { error: "Client et liste requis." },
        { status: 400 }
      );
    }
    const result = await mutateStore((data) => {
      const index = data.savedListPins.findIndex(
        (pin) =>
          pin.clientId === body.clientId && pin.listKey === body.listKey
      );
      if (index >= 0) {
        data.savedListPins.splice(index, 1);
        return { pinned: false };
      }
      data.savedListPins.push({
        clientId: body.clientId!,
        listKey: body.listKey!,
        addedBy: "Zakaria",
        addedAt: new Date().toISOString(),
      });
      return { pinned: true };
    });
    return NextResponse.json(result);
  }

  if (body.action === "retry_signup_email") {
    const signup = await mutateStore((data) => {
      const item = data.emailSignups.find((row) => row.id === body.signupId);
      if (!item) return null;
      item.emailStatus = "queued";
      item.emailError = undefined;
      item.updatedAt = new Date().toISOString();
      return item;
    });
    if (!signup) {
      return NextResponse.json(
        { error: "Inscription introuvable." },
        { status: 404 }
      );
    }
    const delivery = await sendWelcomeCouponEmail(signup);
    const updated = await mutateStore((data) => {
      const item = data.emailSignups.find((row) => row.id === signup.id)!;
      item.emailStatus = delivery.status;
      item.emailError = "error" in delivery ? delivery.error : undefined;
      item.updatedAt = new Date().toISOString();
      return item;
    });
    return NextResponse.json({ signup: updated });
  }

  if (body.action === "create_exchange") {
    if (!body.clientId || !body.exchangeDescription) {
      return NextResponse.json(
        { error: "Client et description requis." },
        { status: 400 }
      );
    }
    const exchange = await mutateStore((data) => {
      const item = {
        id: newId("EX"),
        clientId: body.clientId!,
        orderId: body.orderId || undefined,
        status: "requested" as const,
        description: body.exchangeDescription!.trim(),
        requestedAt: new Date().toISOString(),
      };
      data.exchanges.unshift(item);
      return item;
    });
    return NextResponse.json({ exchange }, { status: 201 });
  }

  if (body.action === "create_manual_order") {
    const product = productBySlug(String(body.slug ?? ""));
    const clientId = String(body.clientId ?? "");
    const pack = body.pack === "duo" ? "duo" : "single";
    const quantity = Math.max(1, Math.floor(Number(body.quantity || 1)));
    if (
      !product ||
      !clientId ||
      !product.sizes.includes(String(body.size ?? "")) ||
      (pack === "duo" && !product.sizes.includes(String(body.sizeB ?? "")))
    ) {
      return NextResponse.json(
        { error: "Client, produit et tailles valides requis." },
        { status: 400 }
      );
    }
    const result = await mutateStore((data) => {
      const client = data.clients.find((item) => item.id === clientId);
      if (!client) return null;
      const stamp = new Date().toISOString();
      const id = `VT-${Date.now().toString(36).toUpperCase()}`;
      const units = pack === "duo" ? quantity * 2 : quantity;
      const totalMad = packPrice(units);
      const rewardCode = generateCouponCode(
        new Set(data.coupons.map((coupon) => coupon.code))
      );
      data.coupons.unshift({
        code: rewardCode,
        amountMad: 50,
        orderId: id,
        createdAt: stamp,
      });
      const order: Order = {
        id,
        createdAt: stamp,
        name: client.name,
        phone: client.phone ?? "",
        email: client.email,
        city: client.city ?? "",
        address: client.deliveryAddress ?? "",
        notes: "",
        lines: [
          {
            id: `${id}-1`,
            slug: product.slug,
            pack,
            size: String(body.size),
            sizeB: pack === "duo" ? String(body.sizeB) : undefined,
            quantity,
          },
        ],
        subtotalMad: totalMad,
        discountMad: 0,
        totalMad,
        rewardCoupon: rewardCode,
        whatsapp: { status: "queued" as const },
        locale: client.preferredLanguage,
        source: "manuel" as const,
        confirmationStatus: "new" as const,
        shipmentStatus: "unfulfilled" as const,
        paymentStatus: "pending" as const,
        updatedAt: stamp,
      };
      data.orders.unshift(order);
      data.orderClientLinks.push({
        orderId: id,
        clientId,
        linkedAt: stamp,
      });
      return order;
    });
    if (!result) {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }
    return NextResponse.json({ order: result }, { status: 201 });
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}

export async function PATCH(req: Request) {
  if (!adminAuthorized(req)) return unauthorized();
  const body = (await req.json().catch(() => null)) as Partial<ClientProfile> & {
    clientId?: string;
  };
  if (!body?.clientId) {
    return NextResponse.json({ error: "Client requis." }, { status: 400 });
  }
  const result = await mutateStore((data) => {
    const client = data.clients.find((item) => item.id === body.clientId);
    if (!client) return null;
    if (typeof body.name === "string" && body.name.trim()) {
      client.name = body.name.trim();
    }
    if (typeof body.phone === "string") {
      client.phone = body.phone.trim() || undefined;
      client.phoneNormalized = normalizePhone(body.phone) || undefined;
    }
    if (typeof body.email === "string") {
      client.email = normalizeEmail(body.email) || undefined;
      client.emailNormalized = normalizeEmail(body.email) || undefined;
    }
    if (!client.phone && !client.email) {
      return { error: "Un téléphone ou un e-mail doit rester renseigné." };
    }
    if (typeof body.city === "string") client.city = body.city.trim() || undefined;
    if (typeof body.deliveryAddress === "string") {
      client.deliveryAddress = body.deliveryAddress.trim() || undefined;
    }
    if (body.preferredLanguage) {
      client.preferredLanguage = body.preferredLanguage;
    }
    if (body.source) client.source = body.source;
    if (typeof body.notes === "string") client.notes = body.notes.slice(0, 4000);
    if (typeof body.assignedStaffId === "string") {
      client.assignedStaffId = body.assignedStaffId || undefined;
    }
    if (typeof body.marketingEmail === "boolean") {
      client.marketingEmail = body.marketingEmail;
    }
    if (typeof body.marketingWhatsApp === "boolean") {
      client.marketingWhatsApp = body.marketingWhatsApp;
    }
    client.updatedAt = new Date().toISOString();
    return { client };
  });
  if (!result) {
    return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
  }
  if ("error" in result) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
