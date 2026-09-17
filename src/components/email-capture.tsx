"use client";

import { FormEvent, useState } from "react";
import { saveEmail, saveLaunchInterest, type LaunchInterest } from "@/lib/emails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";

export function EmailCapture({
  idPrefix = "email",
  compact = false,
  interest,
  submitKey = "email.submit",
  thanksKey = "email.thanks",
  invalidKey = "email.invalid",
  failKey = "launch.fail",
}: {
  idPrefix?: string;
  compact?: boolean;
  interest?: LaunchInterest;
  submitKey?: MessageKey;
  thanksKey?: MessageKey;
  invalidKey?: MessageKey;
  failKey?: MessageKey;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { t, locale } = useI18n();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!email.includes("@")) {
      setError(t(invalidKey));
      return;
    }
    try {
      if (interest) {
        const result = saveLaunchInterest(email, interest, locale);
        if (!result.ok) {
          setError(t(failKey));
          return;
        }
      } else {
        saveEmail(email);
      }
      setError("");
      setDone(true);
    } catch {
      setError(t(failKey));
    }
  }

  if (done) {
    return <p className="text-sm">{t(thanksKey)}</p>;
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
        aria-label={t("launch.emailLabel")}
      />
      <Button type="submit" size="lg" className="h-12 min-h-12">
        {t(submitKey)}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
