import { NextResponse } from "next/server";
import { PRODUCTS } from "@/data/catalog";
import { adminAuthorized } from "@/lib/admin-auth";
import type {
  ConfirmationStatus,
  PaymentStatus,
  ShipmentStatus,
} from "@/lib/order";
import { mutateStore, readStore } from "@/lib/store";

const confirmationStatuses = new Set<ConfirmationStatus>([
  "new",
  "awaiting_confirmation",
  "confirmed",
  "cancelled",
]);
const shipmentStatuses = new Set<ShipmentStatus>([
  "unfulfilled",
  "prepared",
  "dispatched",
  "out_for_delivery",
  "delivered",
  "failed_attempt",
  "returned",
  "cancelled",
]);
const paymentStatuses = new Set<PaymentStatus>([
  "pending",
  "collected",
  "refunded",
]);

function unauthorized() {
  return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
}

export async function GET(req: Request) {
  if (!adminAuthorized(req)) return unauthorized();
  const { orders, coupons, queue } = await readStore();
  return NextResponse.json({
    orders,
    coupons,
    queue,
    products: PRODUCTS.map((product) => ({
      slug: product.slug,
      name: product.name,
      fit: product.fit,
      colour: product.colour,
      sizes: product.sizes,
      stock: product.stock,
      unitPriceMad: product.unitPriceMad,
      duoPriceMad: product.duoPriceMad,
    })),
    integrations: {
      whatsapp: Boolean(
        (process.env.WHATSAPP_TOKEN &&
          process.env.WHATSAPP_PHONE_NUMBER_ID) ||
          (process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_WHATSAPP_FROM)
      ),
      gmail: Boolean(process.env.GMAIL_CLIENT_ID),
      googleSheets: Boolean(
        process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON
      ),
      analytics: Boolean(process.env.GA4_PROPERTY_ID),
    },
    generatedAt: new Date().toISOString(),
  });
}

export async function PATCH(req: Request) {
  if (!adminAuthorized(req)) return unauthorized();

  const body = (await req.json().catch(() => null)) as {
    orderId?: string;
    confirmationStatus?: ConfirmationStatus;
    shipmentStatus?: ShipmentStatus;
    paymentStatus?: PaymentStatus;
    internalNotes?: string;
  } | null;

  if (!body?.orderId) {
    return NextResponse.json(
      { error: "Référence de commande requise." },
      { status: 400 }
    );
  }
  if (
    body.confirmationStatus &&
    !confirmationStatuses.has(body.confirmationStatus)
  ) {
    return NextResponse.json(
      { error: "Statut de confirmation invalide." },
      { status: 400 }
    );
  }
  if (
    body.shipmentStatus &&
    !shipmentStatuses.has(body.shipmentStatus)
  ) {
    return NextResponse.json(
      { error: "Statut de livraison invalide." },
      { status: 400 }
    );
  }
  if (body.paymentStatus && !paymentStatuses.has(body.paymentStatus)) {
    return NextResponse.json(
      { error: "Statut de paiement invalide." },
      { status: 400 }
    );
  }

  const result = await mutateStore((data) => {
    const index = data.orders.findIndex((order) => order.id === body.orderId);
    if (index < 0) return null;
    const order = data.orders[index];
    data.orders[index] = {
      ...order,
      ...(body.confirmationStatus
        ? { confirmationStatus: body.confirmationStatus }
        : {}),
      ...(body.shipmentStatus
        ? { shipmentStatus: body.shipmentStatus }
        : {}),
      ...(body.paymentStatus ? { paymentStatus: body.paymentStatus } : {}),
      ...(typeof body.internalNotes === "string"
        ? { internalNotes: body.internalNotes.trim().slice(0, 2000) }
        : {}),
      updatedAt: new Date().toISOString(),
    };
    return data.orders[index];
  });

  if (!result) {
    return NextResponse.json(
      { error: "Commande introuvable." },
      { status: 404 }
    );
  }
  return NextResponse.json({ order: result });
}

export async function POST(req: Request) {
  if (!adminAuthorized(req)) return unauthorized();

  const body = (await req.json().catch(() => null)) as {
    code?: string;
    amountMad?: number;
  } | null;
  const code = String(body?.code ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 24);
  const amountMad = Math.floor(Number(body?.amountMad));
  if (code.length < 4 || !Number.isFinite(amountMad) || amountMad < 1) {
    return NextResponse.json(
      { error: "Code et montant valides requis." },
      { status: 400 }
    );
  }

  const result = await mutateStore((data) => {
    if (data.coupons.some((coupon) => coupon.code === code)) return null;
    const coupon = {
      code,
      amountMad,
      orderId: "ADMIN",
      createdAt: new Date().toISOString(),
    };
    data.coupons = [coupon, ...data.coupons];
    return coupon;
  });

  if (!result) {
    return NextResponse.json(
      { error: "Ce code existe déjà." },
      { status: 409 }
    );
  }
  return NextResponse.json({ coupon: result }, { status: 201 });
}
