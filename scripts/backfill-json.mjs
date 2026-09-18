import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL absent: backfill JSON ignoré.");
  process.exit(0);
}

const sql = postgres(url, { max: 1 });
const dir = process.env.DATA_DIR || path.join(process.cwd(), "data", "store");

async function readJson(name) {
  try {
    return JSON.parse(await readFile(path.join(dir, name), "utf8"));
  } catch {
    return [];
  }
}

function phone(value) {
  return String(value || "").replace(/\D/g, "");
}

function id(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

try {
  const [orders, coupons, queue] = await Promise.all([
    readJson("orders.json"),
    readJson("coupons.json"),
    readJson("whatsapp-queue.json"),
  ]);
  await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(83927461)`;
    for (const order of orders) {
      await tx`
        INSERT INTO orders (id, created_at, phone_normalized, payload)
        VALUES (
          ${order.id},
          ${order.createdAt},
          ${phone(order.phone)},
          ${tx.json(order)}
        )
        ON CONFLICT (id) DO NOTHING
      `;

      const normalized = phone(order.phone);
      let [client] = normalized
        ? await tx`SELECT id FROM clients WHERE phone_normalized = ${normalized} ORDER BY created_at LIMIT 1`
        : [];
      if (!client) {
        const clientId = id("CL");
        [client] = await tx`
          INSERT INTO clients (
            id, name, phone, phone_normalized, city, delivery_address,
            preferred_language, source, contact_status, created_at, updated_at
          )
          VALUES (
            ${clientId}, ${order.name}, ${order.phone}, ${normalized || null},
            ${order.city || null}, ${order.address || null},
            ${order.locale === "ar" ? "ar" : "fr"}, 'site_web',
            'a_contacter', ${order.createdAt}, now()
          )
          RETURNING id
        `;
      }
      await tx`
        INSERT INTO order_clients (order_id, client_id)
        VALUES (${order.id}, ${client.id})
        ON CONFLICT (order_id) DO NOTHING
      `;
    }
    for (const coupon of coupons) {
      await tx`
        INSERT INTO fixed_coupons (code, created_at, payload)
        VALUES (${coupon.code}, ${coupon.createdAt}, ${tx.json(coupon)})
        ON CONFLICT (code) DO NOTHING
      `;
    }
    for (const item of queue) {
      await tx`
        INSERT INTO whatsapp_queue (id, created_at, payload)
        VALUES (${item.id}, ${item.createdAt}, ${tx.json(item)})
        ON CONFLICT (id) DO NOTHING
      `;
    }
  });
  console.log(
    `Backfill terminé: ${orders.length} commandes, ${coupons.length} coupons, ${queue.length} messages.`
  );
} finally {
  await sql.end();
}
