"use client";

import Link from "next/link";
import { mad } from "@/data/catalog";
import { useI18n } from "@/lib/i18n/provider";
import { SHOP_WHATSAPP_DISPLAY, shopWhatsAppUrl } from "@/lib/whatsapp";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-border bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-heading text-lg text-foreground">Veltrano</p>
          <p className="mt-2 text-muted-foreground">
            Veltrano, un vestiaire denim pour affirmer son style au quotidien. {mad(250)} le jean,{" "}
            {mad(400)} le pack de 2.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/" className="hover:text-foreground">
            {t("nav.home")}
          </Link>
          <Link href="/boutique" className="hover:text-foreground">
            {t("nav.shop")}
          </Link>
          <Link href="/homme" className="hover:text-foreground">
            {t("nav.men")}
          </Link>
          <Link href="/femme" className="hover:text-foreground">
            {t("nav.women")}
          </Link>
          <Link href="/aide/livraison-retours" className="hover:text-foreground">
            Livraison &amp; échanges
          </Link>
          <a
            href={shopWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            WhatsApp {SHOP_WHATSAPP_DISPLAY}
          </a>
        </div>
        <div className="space-y-2 text-muted-foreground">
          <p>Livraison gratuite au Maroc</p>
          <p>
            <Link href="/aide/livraison-retours" className="underline underline-offset-2">
              Échange de taille gratuit sous 7 jours après réception
            </Link>
          </p>
          <p>Homme disponible · Femme en préparation</p>
        </div>
      </div>
    </footer>
  );
}
