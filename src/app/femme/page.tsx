"use client";

import { EmailCapture } from "@/components/email-capture";
import { useI18n } from "@/lib/i18n/provider";

export default function FemmePage() {
  const { t } = useI18n();
  return (
    <div className="bg-white">
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Catégorie</p>
        <h1 className="font-heading mt-3 text-4xl sm:text-5xl">La ligne Femme se prépare.</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Veltrano construit un vestiaire denim pour hommes, femmes et enfants. La collection Femme
          n’est pas encore disponible à l’achat — aucun modèle femme n’est inventé ici. Laissez
          votre email pour être informée du lancement.
        </p>
        <div className="mx-auto mt-10 max-w-md text-start">
          <p className="mb-3 text-center text-sm font-medium">Être informée du lancement.</p>
          <EmailCapture idPrefix="femme-launch" />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            L’offre −10% sur la première commande s’applique si elle est enregistrée pour votre
            email — l’équipe confirme l’éligibilité au moment du lancement.
          </p>
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          En attendant, découvrez les jeans homme baggy et coupe droite dans la{" "}
          <a href="/boutique" className="underline underline-offset-2">
            boutique
          </a>
          .
        </p>
        <p className="sr-only">{t("women.title")}</p>
      </section>
    </div>
  );
}
