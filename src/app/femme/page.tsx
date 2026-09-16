import { EmailCapture } from "@/components/email-capture";
import { getT } from "@/lib/i18n/server";

export default async function FemmePage() {
  const { t } = await getT();
  return (
    <div className="bg-white">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6">
          <p className="text-sm font-medium">{t("women.banner")}</p>
          <p className="mt-2 text-muted-foreground">{t("women.bannerLead")}</p>
          <div className="mx-auto mt-6 max-w-md">
            <EmailCapture idPrefix="femme-banner" compact />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("women.kicker")}</p>
        <h1 className="font-heading mt-3 text-5xl">{t("women.title")}</h1>
        <p className="mt-6 text-lg text-muted-foreground">{t("women.lead")}</p>
      </section>
    </div>
  );
}
