"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";

export function EmailCapture({
  idPrefix = "email",
  compact = false,
}: {
  idPrefix?: string;
  compact?: boolean;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [emailFailed, setEmailFailed] = useState(false);
  const { t, locale } = useI18n();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!email.includes("@")) {
      setError(t("email.invalid"));
      return;
    }
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/email-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          language: locale,
          marketingConsent: data.get("marketingConsent") === "on",
        }),
      });
      const json = (await res.json()) as {
        signup?: { couponCode: string; emailStatus: "queued" | "sent" | "failed" };
        error?: string;
      };
      if (!res.ok || !json.signup) {
        throw new Error(json.error || t("email.saveFailed"));
      }
      setCouponCode(json.signup.couponCode);
      setEmailFailed(json.signup.emailStatus === "failed");
      setDone(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("email.saveFailed"));
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-2 text-sm">
        <p>{t("email.thanks")}</p>
        <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 font-medium">
          {t("email.codeReady", { code: couponCode })}
        </p>
        <p className="text-xs text-muted-foreground">{t("email.codeTerms")}</p>
        {emailFailed ? (
          <p className="text-xs text-muted-foreground">{t("email.deliveryFailed")}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "flex flex-col gap-2 sm:flex-row" : "space-y-3"}>
      <Input
        id={`${idPrefix}-email`}
        name="email"
        type="email"
        required
        placeholder={t("email.placeholder")}
        className="h-10 bg-white"
        aria-label={t("email.label")}
      />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t("email.saving") : t("email.submit")}
      </Button>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="marketingConsent" className="size-4 rounded border" />
        {t("email.consent")}
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
