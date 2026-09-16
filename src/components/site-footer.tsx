import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-heading text-lg text-foreground">Veltrano</p>
          <p className="mt-2 text-muted-foreground">
            Denim pensé pour être porté — et remarqué. {`250 MAD`} le jean, {`400 MAD`}{" "}
            le pack de 2.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/boutique" className="hover:text-foreground">
            Boutique
          </Link>
          <Link href="/homme" className="hover:text-foreground">
            Homme
          </Link>
          <Link href="/femme" className="hover:text-foreground">
            Femme
          </Link>
        </div>
        <div className="text-muted-foreground">
          <p>Livraison Maroc</p>
          <p>Échanges simples par message</p>
          <p>Nouveautés en continu — pas une collection figée</p>
        </div>
      </div>
    </footer>
  );
}
