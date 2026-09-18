import type { Product } from "@/data/catalog";
import { SHIPPING_COUNTRY, SHIPPING_CURRENCY, SHIPPING_MAD } from "@/data/shipping";
import { siteUrl } from "@/lib/site";
import { productImages } from "@/lib/product-images";

export function ProductJsonLd({ product }: { product: Product }) {
  const url = `${siteUrl()}/product/${product.slug}`;
  const images = productImages(product).map((src) =>
    src.startsWith("http") ? src : `${siteUrl()}${src}`
  );
  const content = product.content;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: content.title,
    description: content.shortDescription,
    image: images,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "Veltrano",
    },
    material: content.composition,
    color: content.colourLabel,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "MAD",
      price: product.unitPriceMad,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: SHIPPING_MAD,
          currency: SHIPPING_CURRENCY,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: SHIPPING_COUNTRY,
        },
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
