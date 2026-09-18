import type { Order } from "@/lib/order";
import { productBySlug } from "@/data/catalog";

export const CLIENT_SOURCES = [
  "site_web",
  "popup_email",
  "whatsapp",
  "instagram",
  "telephone",
  "manuel",
] as const;
export type ClientSource = (typeof CLIENT_SOURCES)[number];

export const CONTACT_STATUSES = [
  "a_contacter",
  "pas_de_reponse",
  "rappel_planifie",
  "contacte",
] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_OUTCOMES = [
  "contacte",
  "pas_de_reponse",
  "rappel_planifie",
] as const;
export type ContactOutcome = (typeof CONTACT_OUTCOMES)[number];

export const SAVED_LIST_KEYS = [
  "clients_fideles",
  "achats_baggy",
  "achats_straight",
  "en_attente_echange",
] as const;
export type SavedListKey = (typeof SAVED_LIST_KEYS)[number];

export type ClientProfile = {
  id: string;
  name: string;
  phone?: string;
  phoneNormalized?: string;
  email?: string;
  emailNormalized?: string;
  city?: string;
  deliveryAddress?: string;
  preferredLanguage: "fr" | "ar";
  source: ClientSource;
  notes: string;
  assignedStaffId?: string;
  nextCallbackAt?: string;
  contactStatus: ContactStatus;
  marketingEmail: boolean;
  marketingWhatsApp: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactAttempt = {
  id: string;
  clientId: string;
  outcome: ContactOutcome;
  notes: string;
  nextCallbackAt?: string;
  staffId?: string;
  createdAt: string;
};

export type ExchangeCase = {
  id: string;
  clientId: string;
  orderId?: string;
  status: "requested" | "completed";
  description: string;
  requestedAt: string;
  completedAt?: string;
};

export type ClientNote = {
  id: string;
  clientId: string;
  body: string;
  author: string;
  orderId?: string;
  createdAt: string;
};

export type SavedListPin = {
  listKey: SavedListKey;
  clientId: string;
  addedBy: string;
  addedAt: string;
};

export type StaffMember = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
};

export type EmailSignup = {
  id: string;
  email: string;
  emailNormalized: string;
  language: "fr" | "ar";
  marketingConsent: boolean;
  couponCode: string;
  couponStatus: "active" | "used" | "expired";
  emailStatus: "queued" | "sent" | "failed";
  emailError?: string;
  clientId: string;
  linkedOrderId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type WelcomeCouponEvent = {
  id: string;
  signupId: string;
  fromStatus?: EmailSignup["couponStatus"];
  toStatus: EmailSignup["couponStatus"];
  reason: string;
  createdAt: string;
};

export function normalizePhone(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}

export function normalizeEmail(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

export function findDuplicateClients(
  clients: ClientProfile[],
  phone?: string,
  email?: string
) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedPhone && !normalizedEmail) return [];
  return clients.filter(
    (client) =>
      (normalizedPhone && client.phoneNormalized === normalizedPhone) ||
      (normalizedEmail && client.emailNormalized === normalizedEmail)
  );
}

export function latestOrder(orders: Order[]) {
  return [...orders].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

export function customerMatchesOrderOutcome(
  orders: Order[],
  outcome: "delivered" | "cancelled",
  scope: "latest" | "any",
  from?: string,
  to?: string
) {
  const inRange = orders.filter((order) => {
    const time = new Date(order.createdAt).getTime();
    if (from && time < new Date(`${from}T00:00:00`).getTime()) return false;
    if (to && time > new Date(`${to}T23:59:59.999`).getTime()) return false;
    return true;
  });
  const candidates = scope === "latest" ? [latestOrder(inRange)].filter(Boolean) : inRange;
  return candidates.some((order) =>
    outcome === "delivered"
      ? order.shipmentStatus === "delivered"
      : order.shipmentStatus === "cancelled" ||
        order.confirmationStatus === "cancelled"
  );
}

export function followUpIsOpen(
  client: ClientProfile,
  attempts: ContactAttempt[]
) {
  const latest = [...attempts]
    .filter((attempt) => attempt.clientId === client.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  if (!latest) {
    return (
      client.contactStatus === "a_contacter" &&
      Boolean(client.nextCallbackAt)
    );
  }
  return (
    latest.outcome === "pas_de_reponse" ||
    latest.outcome === "rappel_planifie"
  );
}

export function applyContactAttempt(
  client: ClientProfile,
  outcome: ContactOutcome,
  nextCallbackAt?: string
): ClientProfile {
  const open = outcome !== "contacte";
  return {
    ...client,
    contactStatus: outcome,
    nextCallbackAt: open ? nextCallbackAt : undefined,
    updatedAt: new Date().toISOString(),
  };
}

export function computedListMembership(
  key: SavedListKey,
  orders: Order[],
  exchanges: ExchangeCase[]
) {
  if (key === "clients_fideles") return orders.length >= 2;
  if (key === "en_attente_echange") return exchanges.length > 0;
  if (key === "achats_baggy") {
    return orders.some((order) =>
      order.lines.some((line) => productBySlug(line.slug)?.fit === "baggy")
    );
  }
  return orders.some((order) =>
    order.lines.some((line) => productBySlug(line.slug)?.fit === "straight")
  );
}

export function dedupeClients(clients: ClientProfile[]) {
  return [...new Map(clients.map((client) => [client.id, client])).values()];
}

export function issueWelcomeSignup(
  signups: EmailSignup[],
  client: ClientProfile,
  email: string,
  language: "fr" | "ar",
  marketingConsent: boolean,
  now = new Date(),
  validityDays = 60
) {
  const normalized = normalizeEmail(email);
  const expired = signups.map((signup) =>
    signup.emailNormalized === normalized && signup.couponStatus === "active"
      ? {
          ...signup,
          couponStatus: "expired" as const,
          updatedAt: now.toISOString(),
        }
      : signup
  );
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const used = new Set(signups.map((signup) => signup.couponCode));
  let couponCode = "";
  do {
    couponCode = `VELTRANO-${Array.from({ length: 6 }, () =>
      alphabet[Math.floor(Math.random() * alphabet.length)]
    ).join("")}`;
  } while (used.has(couponCode));
  const signup: EmailSignup = {
    id: newId("ES"),
    email: normalized,
    emailNormalized: normalized,
    language,
    marketingConsent,
    couponCode,
    couponStatus: "active",
    emailStatus: "queued",
    clientId: client.id,
    expiresAt: new Date(
      now.getTime() + validityDays * 24 * 60 * 60 * 1000
    ).toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  return { signups: [signup, ...expired], signup };
}

export function redeemWelcomeCoupon(
  signups: EmailSignup[],
  code: string,
  orderId: string,
  now = new Date()
) {
  const normalized = code.trim().toUpperCase();
  const signup = signups.find((item) => item.couponCode === normalized);
  if (!signup || signup.couponStatus !== "active") return null;
  if (new Date(signup.expiresAt).getTime() <= now.getTime()) return null;
  return signups.map((item) =>
    item.id === signup.id
      ? {
          ...item,
          couponStatus: "used" as const,
          linkedOrderId: orderId,
          updatedAt: now.toISOString(),
        }
      : item
  );
}
