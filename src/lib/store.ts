import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type postgres from "postgres";
import type { Coupon, Order, WhatsAppQueueItem } from "@/lib/order";
import type {
  ClientNote,
  ClientProfile,
  ContactAttempt,
  EmailSignup,
  ExchangeCase,
  SavedListPin,
  StaffMember,
  WelcomeCouponEvent,
} from "@/lib/crm";
import { db, postgresEnabled } from "@/lib/db";

const DIR =
  process.env.DATA_DIR || path.join(process.cwd(), "data", "store");
const ORDERS_FILE = path.join(DIR, "orders.json");
const COUPONS_FILE = path.join(DIR, "coupons.json");
const QUEUE_FILE = path.join(DIR, "whatsapp-queue.json");
const CRM_FILE = path.join(DIR, "crm.json");

export type OrderClientLink = {
  orderId: string;
  clientId: string;
  linkedAt: string;
};

type CrmFile = {
  clients: ClientProfile[];
  orderClientLinks: OrderClientLink[];
  contactAttempts: ContactAttempt[];
  exchanges: ExchangeCase[];
  clientNotes: ClientNote[];
  savedListPins: SavedListPin[];
  emailSignups: EmailSignup[];
  welcomeCouponEvents: WelcomeCouponEvent[];
  staff: StaffMember[];
};

export type StoreFile = CrmFile & {
  orders: Order[];
  coupons: Coupon[];
  queue: WhatsAppQueueItem[];
};

let chain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function emptyCrm(): CrmFile {
  return {
    clients: [],
    orderClientLinks: [],
    contactAttempts: [],
    exchanges: [],
    clientNotes: [],
    savedListPins: [],
    emailSignups: [],
    welcomeCouponEvents: [],
    staff: [
      {
        id: "owner-zakaria",
        name: "Zakaria",
        active: true,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

async function loadJson(): Promise<StoreFile> {
  await mkdir(DIR, { recursive: true });
  const [orders, coupons, queue, crm] = await Promise.all([
    readJson<Order[]>(ORDERS_FILE, []),
    readJson<Coupon[]>(COUPONS_FILE, []),
    readJson<WhatsAppQueueItem[]>(QUEUE_FILE, []),
    readJson<CrmFile>(CRM_FILE, emptyCrm()),
  ]);
  return { orders, coupons, queue, ...emptyCrm(), ...crm };
}

async function saveJson(data: StoreFile) {
  await mkdir(DIR, { recursive: true });
  await Promise.all([
    writeFile(ORDERS_FILE, JSON.stringify(data.orders, null, 2)),
    writeFile(COUPONS_FILE, JSON.stringify(data.coupons, null, 2)),
    writeFile(QUEUE_FILE, JSON.stringify(data.queue, null, 2)),
    writeFile(
      CRM_FILE,
      JSON.stringify(
        {
          clients: data.clients,
          orderClientLinks: data.orderClientLinks,
          contactAttempts: data.contactAttempts,
          exchanges: data.exchanges,
          clientNotes: data.clientNotes,
          savedListPins: data.savedListPins,
          emailSignups: data.emailSignups,
          welcomeCouponEvents: data.welcomeCouponEvents,
          staff: data.staff,
        },
        null,
        2
      )
    ),
  ]);
}

async function loadPostgres(
  sql: postgres.Sql | postgres.TransactionSql = db()
): Promise<StoreFile> {
  const [
    orderRows,
    couponRows,
    queueRows,
    clients,
    orderClientLinks,
    contactAttempts,
    exchanges,
    clientNotes,
    savedListPins,
    emailSignups,
    welcomeCouponEvents,
    staff,
  ] = await Promise.all([
    sql<{ payload: Order }[]>`SELECT payload FROM orders ORDER BY created_at DESC`,
    sql<{ payload: Coupon }[]>`SELECT payload FROM fixed_coupons ORDER BY created_at DESC`,
    sql<{ payload: WhatsAppQueueItem }[]>`SELECT payload FROM whatsapp_queue ORDER BY created_at DESC`,
    sql<ClientProfile[]>`
      SELECT id, name, phone, phone_normalized AS "phoneNormalized",
        email, email_normalized AS "emailNormalized", city,
        delivery_address AS "deliveryAddress",
        preferred_language AS "preferredLanguage", source, notes,
        assigned_staff_id AS "assignedStaffId",
        next_callback_at AS "nextCallbackAt", contact_status AS "contactStatus",
        marketing_email AS "marketingEmail",
        marketing_whatsapp AS "marketingWhatsApp",
        archived_at AS "archivedAt", created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM clients ORDER BY created_at DESC
    `,
    sql<OrderClientLink[]>`
      SELECT order_id AS "orderId", client_id AS "clientId",
        linked_at AS "linkedAt" FROM order_clients
    `,
    sql<ContactAttempt[]>`
      SELECT id, client_id AS "clientId", outcome, notes,
        next_callback_at AS "nextCallbackAt", staff_id AS "staffId",
        created_at AS "createdAt"
      FROM contact_attempts ORDER BY created_at DESC
    `,
    sql<ExchangeCase[]>`
      SELECT id, client_id AS "clientId", order_id AS "orderId", status,
        description, requested_at AS "requestedAt",
        completed_at AS "completedAt"
      FROM exchanges ORDER BY requested_at DESC
    `,
    sql<ClientNote[]>`
      SELECT id, client_id AS "clientId", body, author,
        order_id AS "orderId", created_at AS "createdAt"
      FROM client_notes ORDER BY created_at DESC
    `,
    sql<SavedListPin[]>`
      SELECT list_key AS "listKey", client_id AS "clientId",
        added_by AS "addedBy", added_at AS "addedAt"
      FROM saved_list_pins
    `,
    sql<EmailSignup[]>`
      SELECT id, email, email_normalized AS "emailNormalized", language,
        marketing_consent AS "marketingConsent", coupon_code AS "couponCode",
        coupon_status AS "couponStatus", email_status AS "emailStatus",
        email_error AS "emailError",
        client_id AS "clientId", linked_order_id AS "linkedOrderId",
        expires_at AS "expiresAt", created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM email_signups ORDER BY created_at DESC
    `,
    sql<WelcomeCouponEvent[]>`
      SELECT id, signup_id AS "signupId", from_status AS "fromStatus",
        to_status AS "toStatus", reason, created_at AS "createdAt"
      FROM welcome_coupon_events ORDER BY created_at DESC
    `,
    sql<StaffMember[]>`
      SELECT id, name, active, created_at AS "createdAt"
      FROM staff ORDER BY name
    `,
  ]);
  return {
    orders: orderRows.map((row) => row.payload),
    coupons: couponRows.map((row) => row.payload),
    queue: queueRows.map((row) => row.payload),
    clients,
    orderClientLinks,
    contactAttempts,
    exchanges,
    clientNotes,
    savedListPins,
    emailSignups,
    welcomeCouponEvents,
    staff,
  };
}

async function savePostgresRows(
  data: StoreFile,
  tx: postgres.TransactionSql
) {
    for (const order of data.orders) {
      await tx`
        INSERT INTO orders (id, created_at, phone_normalized, payload)
        VALUES (
          ${order.id}, ${order.createdAt},
          ${String(order.phone || "").replace(/\D/g, "")},
          ${tx.json(order)}
        )
        ON CONFLICT (id) DO UPDATE SET
          phone_normalized = EXCLUDED.phone_normalized,
          payload = EXCLUDED.payload
      `;
    }
    for (const coupon of data.coupons) {
      await tx`
        INSERT INTO fixed_coupons (code, created_at, payload)
        VALUES (${coupon.code}, ${coupon.createdAt}, ${tx.json(coupon)})
        ON CONFLICT (code) DO UPDATE SET payload = EXCLUDED.payload
      `;
    }
    for (const item of data.queue) {
      await tx`
        INSERT INTO whatsapp_queue (id, created_at, payload)
        VALUES (${item.id}, ${item.createdAt}, ${tx.json(item)})
        ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload
      `;
    }
    for (const member of data.staff) {
      await tx`
        INSERT INTO staff (id, name, active, created_at)
        VALUES (${member.id}, ${member.name}, ${member.active}, ${member.createdAt})
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, active = EXCLUDED.active
      `;
    }
    for (const client of data.clients) {
      await tx`
        INSERT INTO clients (
          id, name, phone, phone_normalized, email, email_normalized, city,
          delivery_address, preferred_language, source, notes,
          assigned_staff_id, next_callback_at, contact_status,
          marketing_email, marketing_whatsapp, archived_at, created_at, updated_at
        )
        VALUES (
          ${client.id}, ${client.name}, ${client.phone ?? null},
          ${client.phoneNormalized ?? null}, ${client.email ?? null},
          ${client.emailNormalized ?? null}, ${client.city ?? null},
          ${client.deliveryAddress ?? null}, ${client.preferredLanguage},
          ${client.source}, ${client.notes}, ${client.assignedStaffId ?? null},
          ${client.nextCallbackAt ?? null}, ${client.contactStatus},
          ${client.marketingEmail}, ${client.marketingWhatsApp},
          ${client.archivedAt ?? null}, ${client.createdAt}, ${client.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, phone = EXCLUDED.phone,
          phone_normalized = EXCLUDED.phone_normalized, email = EXCLUDED.email,
          email_normalized = EXCLUDED.email_normalized, city = EXCLUDED.city,
          delivery_address = EXCLUDED.delivery_address,
          preferred_language = EXCLUDED.preferred_language,
          source = EXCLUDED.source, notes = EXCLUDED.notes,
          assigned_staff_id = EXCLUDED.assigned_staff_id,
          next_callback_at = EXCLUDED.next_callback_at,
          contact_status = EXCLUDED.contact_status,
          marketing_email = EXCLUDED.marketing_email,
          marketing_whatsapp = EXCLUDED.marketing_whatsapp,
          archived_at = EXCLUDED.archived_at, updated_at = EXCLUDED.updated_at
      `;
    }
    for (const link of data.orderClientLinks) {
      await tx`
        INSERT INTO order_clients (order_id, client_id, linked_at)
        VALUES (${link.orderId}, ${link.clientId}, ${link.linkedAt})
        ON CONFLICT (order_id) DO UPDATE SET client_id = EXCLUDED.client_id
      `;
    }
    for (const attempt of data.contactAttempts) {
      await tx`
        INSERT INTO contact_attempts (
          id, client_id, outcome, notes, next_callback_at, staff_id, created_at
        )
        VALUES (
          ${attempt.id}, ${attempt.clientId}, ${attempt.outcome}, ${attempt.notes},
          ${attempt.nextCallbackAt ?? null}, ${attempt.staffId ?? null},
          ${attempt.createdAt}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    for (const exchange of data.exchanges) {
      await tx`
        INSERT INTO exchanges (
          id, client_id, order_id, status, description, requested_at, completed_at
        )
        VALUES (
          ${exchange.id}, ${exchange.clientId}, ${exchange.orderId ?? null},
          ${exchange.status}, ${exchange.description}, ${exchange.requestedAt},
          ${exchange.completedAt ?? null}
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status, description = EXCLUDED.description,
          completed_at = EXCLUDED.completed_at
      `;
    }
    for (const note of data.clientNotes) {
      await tx`
        INSERT INTO client_notes (
          id, client_id, body, author, order_id, created_at
        )
        VALUES (
          ${note.id}, ${note.clientId}, ${note.body}, ${note.author},
          ${note.orderId ?? null}, ${note.createdAt}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    await tx`DELETE FROM saved_list_pins`;
    for (const pin of data.savedListPins) {
      await tx`
        INSERT INTO saved_list_pins (list_key, client_id, added_by, added_at)
        VALUES (${pin.listKey}, ${pin.clientId}, ${pin.addedBy}, ${pin.addedAt})
      `;
    }
    for (const signup of data.emailSignups) {
      await tx`
        INSERT INTO email_signups (
          id, email, email_normalized, language, marketing_consent, coupon_code,
          coupon_status, email_status, email_error, client_id, linked_order_id, expires_at,
          created_at, updated_at
        )
        VALUES (
          ${signup.id}, ${signup.email}, ${signup.emailNormalized},
          ${signup.language}, ${signup.marketingConsent}, ${signup.couponCode},
          ${signup.couponStatus}, ${signup.emailStatus}, ${signup.emailError ?? null}, ${signup.clientId},
          ${signup.linkedOrderId ?? null}, ${signup.expiresAt}, ${signup.createdAt},
          ${signup.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          coupon_status = EXCLUDED.coupon_status,
          email_status = EXCLUDED.email_status,
          email_error = EXCLUDED.email_error,
          linked_order_id = EXCLUDED.linked_order_id,
          updated_at = EXCLUDED.updated_at
      `;
    }
    for (const event of data.welcomeCouponEvents) {
      await tx`
        INSERT INTO welcome_coupon_events (
          id, signup_id, from_status, to_status, reason, created_at
        )
        VALUES (
          ${event.id}, ${event.signupId}, ${event.fromStatus ?? null},
          ${event.toStatus}, ${event.reason}, ${event.createdAt}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
}

export function mutateStore<T>(fn: (data: StoreFile) => T | Promise<T>): Promise<T> {
  return withLock(async () => {
    if (postgresEnabled()) {
      const transactionResult = await db().begin(async (tx) => {
        await tx`SELECT pg_advisory_xact_lock(83927461)`;
        const data = await loadPostgres(tx);
        const result = await fn(data);
        await savePostgresRows(data, tx);
        return result;
      });
      return transactionResult as T;
    }
    const data = await loadJson();
    const result = await fn(data);
    await saveJson(data);
    return result;
  });
}

export function readStore(): Promise<StoreFile> {
  return withLock(() => (postgresEnabled() ? loadPostgres() : loadJson()));
}
