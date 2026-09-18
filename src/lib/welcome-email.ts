import type { EmailSignup } from "@/lib/crm";

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function gmailWelcomeConfigured() {
  return Boolean(
    process.env.GMAIL_ACCESS_TOKEN &&
      process.env.GMAIL_SENDER
  );
}

function message(signup: EmailSignup) {
  const shopUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://veltrano.ma";
  const subject =
    signup.language === "ar"
      ? "كود خصم 10% من Veltrano"
      : "Ton code −10% Veltrano";
  const text =
    signup.language === "ar"
      ? `شكراً لتسجيلك في Veltrano.\n\nكود الخصم: ${signup.couponCode}\nخصم 10% لمرة واحدة، صالح حتى ${new Date(signup.expiresAt).toLocaleDateString("ar-MA")}.\n\nتسوّق الآن: ${shopUrl}/boutique`
      : `Merci pour ton inscription à Veltrano.\n\nTon code : ${signup.couponCode}\n−10% en une utilisation, valable jusqu’au ${new Date(signup.expiresAt).toLocaleDateString("fr-MA")}.\n\nVoir la boutique : ${shopUrl}/boutique`;
  return { subject, text };
}

export async function sendWelcomeCouponEmail(signup: EmailSignup) {
  if (!gmailWelcomeConfigured()) {
    return {
      status: "failed" as const,
      error: "Gmail non configuré — coupon conservé pour réessai.",
    };
  }
  const { subject, text } = message(signup);
  const raw = [
    `From: Veltrano <${process.env.GMAIL_SENDER}>`,
    `To: ${signup.email}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    text,
  ].join("\r\n");
  try {
    const res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GMAIL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encodeBase64Url(raw) }),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gmail HTTP ${res.status}: ${body.slice(0, 180)}`);
    }
    return { status: "sent" as const };
  } catch (error) {
    return {
      status: "failed" as const,
      error:
        error instanceof Error
          ? error.message
          : "Échec inconnu lors de l’envoi Gmail.",
    };
  }
}
