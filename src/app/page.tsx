import { CatalogGrid } from "@/components/catalog-grid";
import { mad } from "@/data/catalog";

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-border bg-[#1c1915] text-[#f6f3ee]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-xs uppercase tracking-[0.25em] text-[#d9cbb8]">Veltrano denim</p>
          <h1 className="font-heading mt-4 max-w-2xl text-4xl leading-tight sm:text-6xl">
            Douze jeans. Deux coupes. Un prix clair.
          </h1>
          <p className="mt-6 max-w-xl text-base text-[#d9cbb8] sm:text-lg">
            Baggy et straight fit, {mad(250)} le jean, {mad(400)} le pack de 2. Catalogue
            officiel — photos Drive dès qu’elles sont disponibles.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <CatalogGrid />
      </section>
    </div>
  );
}
