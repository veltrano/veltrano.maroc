"use client";

import Link from "next/link";
import { displayName, mad } from "@/data/catalog";
import {
  cartTotal,
  cartUnitCount,
  linePrice,
  lineProduct,
  lineUnitCount,
  useCart,
} from "@/lib/cart";
import { productImages } from "@/lib/product-images";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { lines, setQty, remove } = useCart();
  const empty = lines.length === 0;

  if (empty) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-heading text-3xl">Panier vide</h1>
        <p className="mt-3 text-muted-foreground">
          Ajoutez un jean baggy ou straight fit pour commencer une commande.
        </p>
        <Link href="/" className={cn(buttonVariants(), "mt-6 inline-flex")}>
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl">Panier</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {cartUnitCount(lines)} jean{cartUnitCount(lines) > 1 ? "s" : ""} · {mad(cartTotal(lines))}
      </p>
      <ul className="mt-8 space-y-6">
        {lines.map((line) => {
          const product = lineProduct(line);
          if (!product) return null;
          const img = productImages(product)[0];
          return (
            <li key={line.id} className="flex gap-4 border-b border-border pb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                className="h-28 w-20 rounded-lg object-cover sm:h-36 sm:w-28"
              />
              <div className="min-w-0 flex-1">
                <p className="font-heading capitalize">{displayName(product)}</p>
                <p className="text-sm text-muted-foreground">
                  {line.pack === "duo" ? "Pack de 2" : "1 jean"} · taille{" "}
                  {line.pack === "duo" ? `${line.size} + ${line.sizeB}` : line.size}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQty(line.id, line.quantity - 1)}
                  >
                    −
                  </Button>
                  <span>{line.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQty(line.id, line.quantity + 1)}
                  >
                    +
                  </Button>
                  <button
                    type="button"
                    className="ml-2 text-sm underline"
                    onClick={() => remove(line.id)}
                  >
                    Retirer
                  </button>
                </div>
              </div>
              <div className="text-right text-sm">
                <div>{lineUnitCount(line)} pce</div>
                <div className="font-medium">{mad(linePrice(line))}</div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 flex flex-col items-end gap-4">
        <p className="text-lg">
          Total <span className="font-medium">{mad(cartTotal(lines))}</span>
        </p>
        <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "inline-flex")}>
          Continuer vers la commande
        </Link>
      </div>
    </div>
  );
}
