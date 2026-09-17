"use client";

import Link from "next/link";
import { EmailCapture } from "@/components/email-capture";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/messages";

export type ComingSoonAudience = "femme" | "enfant";

const COPY: Record<
  ComingSoonAudience,
  {
    kicker: MessageKey;
    badge: MessageKey;
    title: MessageKey;
    lead: MessageKey;
    emailLabel: MessageKey;
    submit: MessageKey;
    thanks: MessageKey;
    secondary: MessageKey;
  }
> = {
  femme: {
    kicker: "women.kicker",
    badge: "women.badge",
    title: "women.heading",
    lead: "women.leadNew",
    emailLabel: "launch.emailLabel",
    submit: "women.submit",
    thanks: "women.thanks",
    secondary: "launch.seeAvailable",
  },
  enfant: {
    kicker: "kids.kicker",
    badge: "kids.badge",
    title: "kids.heading",
    lead: "kids.lead",
    emailLabel: "launch.emailLabel",
    submit: "kids.submit",
    thanks: "kids.thanks",
    secondary: "launch.seeAvailable",
  },
};

export function ComingSoonPage({ audience }: { audience: ComingSoonAudience }) {
  const { t } = useI18n();
  const c = COPY[audience];

  return (
    <div className="bg-white">
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {t(c.kicker)}
        </p>
        <p className="mt-4 inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium">
          {t(c.badge)}
        </p>
        <h1 className="font-heading mt-5 text-4xl sm:text-5xl">{t(c.title)}</h1>
        <p className="mt-6 text-lg text-muted-foreground">{t(c.lead)}</p>
        <div className="mx-auto mt-10 max-w-md text-start">
          <p className="mb-3 text-center text-sm font-medium">{t(c.emailLabel)}</p>
          <EmailCapture
            idPrefix={`${audience}-launch`}
            interest={audience}
            submitKey={c.submit}
            thanksKey={c.thanks}
          />
        </div>
        <div className="mt-10">
          <Link
            href="/boutique"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "inline-flex h-12")}
          >
            {t(c.secondary)}
          </Link>
        </div>
      </section>
    </div>
  );
}
