export const catalogMarginPolicy = {
  vatRate: 0.21,
  paymentRate: 0.019,
  paymentFixedFee: 0.25,
  targetContributionMargin: 0.4,
  minimumRetailPrice: 9.95,
} as const;

const roundUpToNinetyFive = (value: number) => {
  const candidate = Math.floor(value) + 0.95;
  return Number((candidate + (candidate < value ? 1 : 0)).toFixed(2));
};

export const protectedRetailPrice = (purchasePrice: number) => {
  const policy = catalogMarginPolicy;
  const availableRevenueShare =
    1 / (1 + policy.vatRate) -
    policy.paymentRate -
    policy.targetContributionMargin;
  const requiredRetailPrice =
    (purchasePrice + policy.paymentFixedFee) / availableRevenueShare;

  return roundUpToNinetyFive(
    Math.max(policy.minimumRetailPrice, requiredRetailPrice),
  );
};

export const catalogMarginSnapshot = (
  purchasePrice: number,
  retailPrice: number,
) => {
  const policy = catalogMarginPolicy;
  const revenueExVat = retailPrice / (1 + policy.vatRate);
  const paymentCosts =
    retailPrice * policy.paymentRate + policy.paymentFixedFee;
  const contribution = revenueExVat - purchasePrice - paymentCosts;

  return {
    revenue_ex_vat: Number(revenueExVat.toFixed(2)),
    payment_costs: Number(paymentCosts.toFixed(2)),
    contribution: Number(contribution.toFixed(2)),
    contribution_margin_percent: Number(
      ((contribution / retailPrice) * 100).toFixed(1),
    ),
  };
};

export const compareAtPrice = (retailPrice: number, discountPercent: number) =>
  roundUpToNinetyFive(retailPrice / (1 - discountPercent / 100));
