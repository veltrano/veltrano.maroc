import { CatalogGrid } from "@/components/catalog-grid";

export default function HommePage() {
  return (
    <div className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Category</p>
        <h1 className="font-heading mt-2 text-4xl">Homme</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Les jeans Veltrano disponibles aujourd’hui — baggy et straight. Tailles et packs
          sur chaque fiche.
        </p>
        <div className="mt-10">
          <CatalogGrid />
        </div>
      </section>
    </div>
  );
}
