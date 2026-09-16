"use client";

import { FormEvent, useState } from "react";
import { saveEmail } from "@/lib/emails";
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
  const { t } = useI18n();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!email.includes("@")) {
      setError(t("email.invalid"));
      return;
    }
    saveEmail(email);
    setError("");
    setDone(true);
  }

  if (done) {
    return <p className="text-sm">{t("email.thanks")}</p>;
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
      <Button type="submit" size="lg">
        {t("email.submit")}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
