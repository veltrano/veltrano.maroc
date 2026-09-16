import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { PRODUCTS, productBySlug } from "@/data/catalog";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
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
      <ProductDetail product={product} />
    </div>
  );
}
