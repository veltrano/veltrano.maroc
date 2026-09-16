export const SHOP_WHATSAPP_E164 = "212777236482";
export const SHOP_WHATSAPP_DISPLAY = "+212 777-236482";

/** Morocco mobile digits for wa.me, or null if we cannot format reliably. */
export function moroccoWaDigits(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("212") && d.length >= 12) return d.slice(0, 12);
  if (d.startsWith("0") && d.length >= 10) return `212${d.slice(1, 10)}`;
  if (d.length === 9 && (d.startsWith("6") || d.startsWith("7"))) return `212${d}`;
  if (d.length >= 11 && d.startsWith("212")) return d;
  return null;
}

export function shopWhatsAppUrl(text?: string) {
  const base = `https://wa.me/${SHOP_WHATSAPP_E164}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function customerWhatsAppUrl(phone: string, text: string) {
  const digits = moroccoWaDigits(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
