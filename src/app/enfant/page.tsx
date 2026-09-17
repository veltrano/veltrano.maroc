import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/coming-soon-page";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "ar") {
    return {
      title: "تشكيلة الأطفال قريبًا — Veltrano",
      description:
        "تشكيلة الدنيم للأطفال من Veltrano قريبًا. سجّل بريدك الإلكتروني ليصلك إشعار بالإطلاق وتتعرف على الموديلات القادمة.",
      alternates: { canonical: "/enfant" },
    };
  }
  return {
    title: "Collection Enfant : bientôt disponible — Veltrano",
    description:
      "La collection denim Enfant de Veltrano arrive bientôt. Inscrivez-vous pour être informé du lancement et découvrir les futurs modèles.",
    alternates: { canonical: "/enfant" },
  };
}

export default function EnfantPage() {
  return <ComingSoonPage audience="enfant" />;
}
