import { NextResponse } from "next/server";
import {
  issueWelcomeSignup,
  newId,
  normalizeEmail,
  type ClientProfile,
} from "@/lib/crm";
import { mutateStore } from "@/lib/store";
import { sendWelcomeCouponEmail } from "@/lib/welcome-email";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    language?: "fr" | "ar";
    marketingConsent?: boolean;
    source?: string;
  } | null;
  const email = normalizeEmail(body?.email);
  if (!validEmail(email)) {
    return NextResponse.json(
      { error: "Adresse e-mail invalide." },
      { status: 400 }
    );
  }
  const language = body?.language === "ar" ? "ar" : "fr";
  const marketingConsent = body?.marketingConsent === true;
  const validityDays = Math.max(
    1,
    Number(process.env.WELCOME_COUPON_VALIDITY_DAYS || 60)
  );

  const created = await mutateStore((data) => {
    const now = new Date();
    let client = data.clients.find(
      (item) => item.emailNormalized === email && !item.archivedAt
    );
    if (!client) {
      const stamp = now.toISOString();
      client = {
        id: newId("CL"),
        name: email.split("@")[0],
        email,
        emailNormalized: email,
        preferredLanguage: language,
        source: "popup_email",
        notes: "",
        contactStatus: "a_contacter",
        marketingEmail: marketingConsent,
        marketingWhatsApp: false,
        createdAt: stamp,
        updatedAt: stamp,
      } satisfies ClientProfile;
      data.clients = [client, ...data.clients];
    } else {
      client.marketingEmail = client.marketingEmail || marketingConsent;
      client.preferredLanguage = language;
      client.updatedAt = now.toISOString();
    }

    const previousActive = data.emailSignups.filter(
      (signup) =>
        signup.emailNormalized === email && signup.couponStatus === "active"
    );
    const result = issueWelcomeSignup(
      data.emailSignups,
      client,
      email,
      language,
      marketingConsent,
      now,
      validityDays
    );
    data.emailSignups = result.signups;
    data.welcomeCouponEvents.unshift({
      id: newId("WCE"),
      signupId: result.signup.id,
      toStatus: "active",
      reason: "Inscription popup",
      createdAt: now.toISOString(),
    });
    previousActive.forEach((signup) =>
      data.welcomeCouponEvents.unshift({
        id: newId("WCE"),
        signupId: signup.id,
        fromStatus: "active",
        toStatus: "expired",
        reason: "Nouvelle inscription pour la même adresse e-mail",
        createdAt: now.toISOString(),
      })
    );
    return result.signup;
  });

  const delivery = await sendWelcomeCouponEmail(created);
  const signup = await mutateStore((data) => {
    const current = data.emailSignups.find((item) => item.id === created.id);
    if (!current) return created;
    current.emailStatus = delivery.status;
    current.emailError = "error" in delivery ? delivery.error : undefined;
    current.updatedAt = new Date().toISOString();
    return current;
  });

  return NextResponse.json(
    {
      signup: {
        id: signup.id,
        couponCode: signup.couponCode,
        couponStatus: signup.couponStatus,
        emailStatus: signup.emailStatus,
        expiresAt: signup.expiresAt,
      },
    },
    { status: 201 }
  );
}
