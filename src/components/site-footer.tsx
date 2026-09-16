import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-[#efeae2]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-heading text-foreground">Veltrano</p>
        <p>Jeans baggy et straight fit. 250 MAD l’unité, 400 MAD le pack de 2.</p>
        <Link href="/" className="hover:text-foreground">
          Boutique
        </Link>
      </div>
    </footer>
  );
}
