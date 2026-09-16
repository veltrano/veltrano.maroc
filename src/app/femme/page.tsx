import { EmailCapture } from "@/components/email-capture";

export default function FemmePage() {
  return (
    <div className="bg-white">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6">
          <p className="text-sm font-medium">Bientôt — ligne Femme</p>
          <p className="mt-2 text-muted-foreground">
            Laisse ton email : −10% sur ta première commande Veltrano.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <EmailCapture idPrefix="femme-banner" compact />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Catégorie</p>
        <h1 className="font-heading mt-3 text-5xl">Femme</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Arrive bientôt. La coupe, le wash, l’attitude — version elle. On prépare la
          ligne. Inscris-toi au-dessus pour les nouveautés et le −10%.
        </p>
      </section>
    </div>
  );
}
