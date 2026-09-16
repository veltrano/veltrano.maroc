export const COUPON_VALUE_MAD = 50;

export function generateCouponCode(used: Set<string>) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < 20; i++) {
    let tail = "";
    for (let j = 0; j < 6; j++) {
      tail += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    const code = `VT50-${tail}`;
    if (!used.has(code)) return code;
  }
  return `VT50-${Date.now().toString(36).toUpperCase()}`;
}
