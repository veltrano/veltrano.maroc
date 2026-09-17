import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { PRODUCTS, productBySlug } from "@/data/catalog";
import { siteUrl } from "@/lib/site";
import { productImages } from "@/lib/product-images";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return {};
  const content = product.content;
  const images = productImages(product);
  const og = images[0]
    ? [{ url: images[0], alt: content.imageAltFlat }]
    : undefined;
  return {
    title: content.seoTitle,
    description: content.metaDescription,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: content.seoTitle,
      description: content.metaDescription,
      url: `${siteUrl()}/product/${product.slug}`,
      images: og,
      type: "website",
      locale: "fr_MA",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground">
          Accueil
        </a>
        {" · "}
        <a href="/boutique" className="hover:text-foreground">
          Boutique
        </a>
        {" · "}
        <a
          href={product.fit === "baggy" ? "/homme?fit=baggy" : "/homme?fit=straight"}
          className="hover:text-foreground"
        >
          {product.fit === "baggy" ? "Baggy" : "Coupe droite"}
        </a>
        {" · "}
        <span className="text-foreground">{product.content.colourLabel}</span>
      </nav>
      <ProductDetail product={product} />
    </div>
  );
}
