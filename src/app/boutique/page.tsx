import { CatalogGrid } from "@/components/catalog-grid";

export default function BoutiquePage() {
  return (
    <div className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Boutique</p>
        <h1 className="font-heading mt-2 text-4xl">Toute la ligne</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Baggy et coupe droite, disponibles maintenant. Filtre par coupe et par wash —
          d’autres pièces rejoignent la boutique au fil des nouveautés.
        </p>
        <div className="mt-10">
          <CatalogGrid />
        </div>
      </section>
    </div>
  );
}
