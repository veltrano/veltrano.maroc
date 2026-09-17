"use client";

import { eligibleReviews } from "@/data/reviews";
import type { Fit } from "@/data/catalog";

export function ProductReviews({
  fit,
  productSlug,
}: {
  fit: Fit;
  productSlug: string;
}) {
  const reviews = eligibleReviews({ fit, productSlug });
  const published = reviews.filter((r) => r.publish && !r.isDemo);

  if (published.length === 0) {
    return (
      <section>
        <h2 className="font-heading text-2xl">Avis clients</h2>
        <p className="mt-3 text-muted-foreground">
          Vous avez porté ce modèle ? Partagez votre avis pour aider les prochains clients à
          choisir.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Les avis authentiques apparaîtront ici dès qu’ils seront publiés. Aucune note fictive
          n’est affichée.
        </p>
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
      <h2 className="font-heading text-2xl">Avis clients</h2>
      {avg !== null ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {avg.toFixed(1)} / 5 · {published.length} avis
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{published.length} avis</p>
      )}
      <ul className="mt-6 space-y-4">
        {published.map((r) => (
          <li key={r.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">{r.author}</p>
              {typeof r.rating === "number" ? (
                <p className="text-sm text-muted-foreground">{r.rating}/5</p>
              ) : null}
            </div>
            {r.verifiedPurchase ? (
              <p className="mt-1 text-xs text-muted-foreground">Achat vérifié</p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed">{r.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
