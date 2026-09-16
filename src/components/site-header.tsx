"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
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

const links = [
  { href: "/", label: "Boutique" },
  { href: "/cart", label: "Panier" },
  { href: "/orders", label: "Commandes" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { lines } = useCart();
  const count = cartUnitCount(lines);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-[#f6f3ee]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-xl tracking-tight text-foreground">
          Veltrano
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (
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
                {links.map((l) => (
                  <Link key={l.href} href={l.href} className="text-lg">
                    {l.label}
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
