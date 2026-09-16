import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-heading text-3xl">{t("notFound.title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("notFound.lead")}</p>
      <Link href="/" className="mt-6 inline-block underline">
        {t("notFound.back")}
      </Link>
    </div>
  );
}
