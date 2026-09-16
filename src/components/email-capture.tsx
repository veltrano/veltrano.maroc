"use client";

import { FormEvent, useState } from "react";
import { saveEmail } from "@/lib/emails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EmailCapture({
  idPrefix = "email",
  compact = false,
}: {
  idPrefix?: string;
  compact?: boolean;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!email.includes("@")) {
      setError("Entre une adresse email valide.");
      return;
    }
    saveEmail(email);
    setError("");
    setDone(true);
  }

  if (done) {
    return (
      <p className="text-sm">
        Merci. Ton −10% sur la première commande est enregistré.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "flex flex-col gap-2 sm:flex-row" : "space-y-3"}>
      <Input
        id={`${idPrefix}-email`}
        name="email"
        type="email"
        required
        placeholder="ton@email.com"
        className="h-10 bg-white"
        aria-label="Email"
      />
      <Button type="submit" size="lg">
        Recevoir −10%
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
