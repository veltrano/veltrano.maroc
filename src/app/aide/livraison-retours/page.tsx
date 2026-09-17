import type { Metadata } from "next";
import Link from "next/link";
import { shopWhatsAppUrl, SHOP_WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Livraison, échanges et retours | Veltrano",
  description:
    "Livraison gratuite au Maroc, échange de taille gratuit sous 7 jours après réception, et conditions de retour Veltrano.",
  alternates: { canonical: "/aide/livraison-retours" },
};

export default function AideLivraisonRetoursPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Aide</p>
      <h1 className="font-heading mt-2 text-4xl">Livraison, échanges et retours</h1>
      <p className="mt-4 text-muted-foreground">
        Informations commerciales confirmées pour les commandes Veltrano au Maroc.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">Livraison</h2>
        <p>
          <strong>Livraison gratuite au Maroc.</strong> Les frais de port sont de 0 MAD pour une
          commande d’un jean comme pour un pack de 2, sans minimum d’achat.
        </p>
        <p className="text-sm text-muted-foreground">
          Les délais et le suivi dépendent de l’organisation logistique au moment de votre commande.
          L’équipe vous contacte après enregistrement pour confirmer les détails.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">Échange de taille</h2>
        <p>
          La taille ne vous convient pas ? Demandez un{" "}
          <strong>échange de taille gratuit dans les 7 jours suivant la réception</strong> de votre
          commande. Contactez notre équipe pour organiser l’échange.
        </p>
        <p className="text-sm text-muted-foreground">
          Ce délai concerne la demande d’échange après réception — ce n’est pas un délai de
          livraison de la taille de remplacement. Un échange de taille n’est pas un remboursement.
          Si la date de réception n’est pas clairement enregistrée, l’équipe vérifie votre demande
          avant de la traiter.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">Retours</h2>
        <p>
          Retours acceptés dans les 7 jours suivant la livraison, si l’article est inutilisé et dans
          son état d’origine. Contactez notre équipe pour connaître la procédure.
        </p>
        <p className="text-sm text-muted-foreground">
          Les frais éventuels et le mode de remboursement (notamment en cas de paiement à la
          livraison) sont précisés lors de la demande — ils ne sont pas encore formalisés ici.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">Nous contacter</h2>
        <p>
          WhatsApp boutique :{" "}
          <a
            className="underline underline-offset-2"
            href={shopWhatsAppUrl(
              "Bonjour, j’ai une question sur la livraison, un échange de taille ou un retour."
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            {SHOP_WHATSAPP_DISPLAY}
          </a>
        </p>
        <p>
          <Link href="/boutique" className="underline underline-offset-2">
            Retour à la boutique
          </Link>
        </p>
      </section>
    </div>
  );
}
