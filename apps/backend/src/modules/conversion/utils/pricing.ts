export type QuantityTierInput = {
  quantity: number;
  discount_percentage: number;
};

export function getQuantityDiscount(
  tiers: QuantityTierInput[],
  quantity: number,
) {
  const activeTier = [...tiers]
    .sort((a, b) => b.quantity - a.quantity)
    .find((tier) => quantity >= tier.quantity);

  return Math.max(0, Math.min(100, Number(activeTier?.discount_percentage || 0)));
}

export function applyPercentageDiscount(
  baseUnitPrice: number,
  discountPercentage: number,
) {
  const safeDiscount = Math.max(0, Math.min(100, discountPercentage));
  return Math.round(baseUnitPrice * (1 - safeDiscount / 100));
}
