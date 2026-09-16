"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cartUnitCount, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const topLinks = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
];

const categories = [
  { href: "/homme", label: "Homme" },
  { href: "/femme", label: "Femme" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { lines } = useCart();
  const count = cartUnitCount(lines);
  const categoryActive = pathname === "/homme" || pathname === "/femme";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-xl tracking-tight text-foreground">
          Veltrano
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {topLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                pathname === l.href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              {l.label}
            </Link>
          ))}
          <div className="group relative">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1",
                categoryActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-haspopup="true"
            >
              Catégorie
              <ChevronDown className="size-3.5" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 min-w-36 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-xl border border-border bg-white py-2 shadow-md">
                {categories.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="block px-4 py-2 text-foreground hover:bg-muted"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label="Panier"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
          >
            <ShoppingBag className="size-4" />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Link>
          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "md:hidden"
              )}
              aria-label="Menu"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Veltrano</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4">
                {topLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="text-lg">
                    {l.label}
                  </Link>
                ))}
                <p className="pt-2 text-xs uppercase tracking-widest text-muted-foreground">
                  Catégorie
                </p>
                {categories.map((c) => (
                  <Link key={c.href} href={c.href} className="text-lg">
                    {c.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
