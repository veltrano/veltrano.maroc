import { moroccoWaDigits } from "@/lib/whatsapp";
import { mutateStore } from "@/lib/store";
import type { Order, WhatsAppDelivery, WhatsAppQueueItem } from "@/lib/order";

function metaReady() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

function twilioReady() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_FROM
  );
}

export function whatsappConfigured() {
  return metaReady() || twilioReady();
}

async function sendMeta(to: string, body: string) {
  const version = process.env.WHATSAPP_GRAPH_VERSION || "v22.0";
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const res = await fetch(`https://graph.facebook.com/${version}/${id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body },
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message || `Meta WhatsApp HTTP ${res.status}`);
  }
}

async function sendTwilio(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const from = process.env.TWILIO_WHATSAPP_FROM!;
  const params = new URLSearchParams({
    From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    To: `whatsapp:+${to}`,
    Body: body,
  });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const json = (await res.json().catch(() => ({}))) as { message?: string; error_message?: string };
  if (!res.ok) {
    throw new Error(json.error_message || json.message || `Twilio HTTP ${res.status}`);
  }
}

async function enqueue(orderId: string, to: string, body: string, reason: string) {
  const item: WhatsAppQueueItem = {
    id: `WAQ-${Date.now().toString(36).toUpperCase()}`,
    orderId,
    to,
    body,
    createdAt: new Date().toISOString(),
    reason,
  };
  await mutateStore((data) => {
    data.queue = [item, ...data.queue];
  });
  return item;
}

export async function deliverOrderWhatsApp(
  order: Order,
  body: string
): Promise<WhatsAppDelivery> {
  const to = moroccoWaDigits(order.phone);
  const now = new Date().toISOString();
  if (!to) {
    await enqueue(order.id, order.phone, body, "Numéro WhatsApp invalide.");
    return { status: "failed", queuedAt: now, error: "Numéro WhatsApp invalide." };
  }

  if (metaReady()) {
    try {
      await sendMeta(to, body);
      return { status: "sent", provider: "meta", sentAt: now };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Échec Meta WhatsApp.";
      await enqueue(order.id, to, body, error);
      return { status: "failed", provider: "meta", queuedAt: now, error };
    }
  }

  if (twilioReady()) {
    try {
      await sendTwilio(to, body);
      return { status: "sent", provider: "twilio", sentAt: now };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Échec Twilio WhatsApp.";
      await enqueue(order.id, to, body, error);
      return { status: "failed", provider: "twilio", queuedAt: now, error };
    }
  }

  await enqueue(
    order.id,
    to,
    body,
    "Identifiants WhatsApp absents (WHATSAPP_TOKEN / Twilio)."
  );
  return {
    status: "queued",
    queuedAt: now,
    error: "Identifiants WhatsApp absents — message mis en file.",
  };
}
