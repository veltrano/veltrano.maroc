import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans_Arabic, Outfit } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { siteUrl } from "@/lib/site";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translate";
import { dirFor } from "@/lib/i18n/locale";
import { LocaleProvider } from "@/lib/i18n/provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: t(locale, "meta.title"),
      template: "%s",
    },
    description: t(locale, "meta.description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={dirFor(locale)}>
      <body
        className={`${outfit.variable} ${fraunces.variable} ${arabic.variable} font-sans antialiased`}
      >
        <LocaleProvider initialLocale={locale}>
          <AppShell>{children}</AppShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
