"use client";

import { useMemo, useState } from "react";
import { FITS, PRODUCTS, type Fit } from "@/data/catalog";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

const colours = ["all", ...Array.from(new Set(PRODUCTS.map((p) => p.colour)))];

export function CatalogGrid() {
  const [fit, setFit] = useState<Fit | "all">("all");
  const [colour, setColour] = useState("all");

  const items = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (fit !== "all" && p.fit !== fit) return false;
      if (colour !== "all" && p.colour !== colour) return false;
      return true;
    });
  }, [fit, colour]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FITS.map((f) => (
            <Button
              key={f.id}
              type="button"
              size="sm"
              variant={fit === f.id ? "default" : "outline"}
              onClick={() => setFit(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <label className="text-sm text-muted-foreground">
          Couleur
          <select
            className="ml-2 rounded-lg border border-border bg-white px-3 py-2 text-foreground capitalize"
            value={colour}
            onChange={(e) => setColour(e.target.value)}
          >
            {colours.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "Toutes" : c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          Aucun jean pour ce filtre. Réinitialise la coupe ou la couleur.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
