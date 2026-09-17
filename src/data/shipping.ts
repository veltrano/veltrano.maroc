/** Free shipping for supported Moroccan orders — owner-confirmed. */
export const SHIPPING_MAD = 0;
export const SHIPPING_CURRENCY = "MAD";
export const SHIPPING_COUNTRY = "MA";
export const SHIPPING_LABEL_FR = "Livraison gratuite au Maroc";
export const SHIPPING_LINE_FR = "Livraison : Gratuite";

export function shippingForOrder(): number {
  return SHIPPING_MAD;
}
