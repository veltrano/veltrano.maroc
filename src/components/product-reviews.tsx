"use client";

import { useSearchParams } from "next/navigation";
import { eligibleReviews } from "@/data/reviews";
import type { Fit } from "@/data/catalog";
import { useI18n } from "@/lib/i18n/provider";

export function ProductReviews({
  fit,
  productSlug,
}: {
  fit: Fit;
  productSlug: string;
}) {
  const { t, locale } = useI18n();
  const search = useSearchParams();
  const allowDemoPreview =
    process.env.NODE_ENV !== "production" && search.get("demoReviews") === "1";

  const reviews = eligibleReviews({
    fit,
    productSlug,
    includeDemo: allowDemoPreview,
    locale,
  });
  const published = reviews.filter((r) => r.publish && !r.isDemo);
  const demos = allowDemoPreview ? reviews.filter((r) => r.isDemo) : [];
  const visible = published.length > 0 ? published : demos;

  if (visible.length === 0) {
    return (
      <section>
        <h2 className="font-heading text-2xl">{t("reviews.title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("reviews.empty")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("reviews.emptyHint")}</p>
      </section>
    );
  }

  const rated = published.filter((r) => typeof r.rating === "number") as Array<
    (typeof published)[number] & { rating: number }
  >;
  const avg =
    rated.length > 0
      ? rated.reduce((sum, r) => sum + r.rating, 0) / rated.length
      : null;

  return (
    <section>
      <h2 className="font-heading text-2xl">{t("reviews.title")}</h2>
      {published.length > 0 && avg !== null ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {avg.toFixed(1)} / 5 · {published.length}
        </p>
      ) : published.length > 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{published.length}</p>
      ) : null}
      <ul className="mt-6 space-y-4">
        {visible.map((r) => (
          <li key={r.id} className="rounded-xl border border-border p-4">
            {r.isDemo ? (
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-800">
                {t("reviews.demoNote")}
              </p>
            ) : null}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">{r.author ?? (locale === "ar" ? r.authorAr : r.authorFr)}</p>
              {typeof r.rating === "number" ? (
                <p className="text-sm text-muted-foreground">{r.rating}/5</p>
              ) : null}
            </div>
            {r.verifiedPurchase ? (
              <p className="mt-1 text-xs text-muted-foreground">✓</p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed">
              {r.text ?? (locale === "ar" ? r.textAr : r.textFr)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
