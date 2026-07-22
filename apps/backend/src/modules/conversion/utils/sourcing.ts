export type NullableNumber = number | null | undefined;

export type SourcingCosts = {
  purchase_price?: NullableNumber;
  supplier_shipping?: NullableNumber;
  inbound_handling?: NullableNumber;
  import_duties?: NullableNumber;
  outbound_fulfillment?: NullableNumber;
  other_costs?: NullableNumber;
  return_reserve_rate?: NullableNumber;
  ad_cost_rate?: NullableNumber;
  vat_rate?: NullableNumber;
  payment_rate?: NullableNumber;
  payment_fixed_fee?: NullableNumber;
};

const numberOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const resolveSourcingCosts = (
  product: SourcingCosts,
  category: SourcingCosts = {},
  global: SourcingCosts = {},
) => {
  const keys = [
    "purchase_price",
    "supplier_shipping",
    "inbound_handling",
    "import_duties",
    "outbound_fulfillment",
    "other_costs",
    "return_reserve_rate",
    "ad_cost_rate",
    "vat_rate",
    "payment_rate",
    "payment_fixed_fee",
  ] as const;

  return Object.fromEntries(
    keys.map((key) => [
      key,
      numberOrNull(product[key]) ?? numberOrNull(category[key]) ?? numberOrNull(global[key]),
    ]),
  ) as Record<(typeof keys)[number], number | null>;
};

export const calculateSourcingMargin = (
  retailPrice: number,
  costs: ReturnType<typeof resolveSourcingCosts>,
) => {
  const required = [
    "purchase_price",
    "supplier_shipping",
    "inbound_handling",
    "import_duties",
    "outbound_fulfillment",
    "other_costs",
    "return_reserve_rate",
    "ad_cost_rate",
    "vat_rate",
    "payment_rate",
    "payment_fixed_fee",
  ] as const;
  const missing = required.filter((key) => costs[key] === null);
  const purchasePrice = costs.purchase_price ?? 0;
  const vatRate = costs.vat_rate ?? 0;
  const paymentRate = costs.payment_rate ?? 0;
  const paymentFixedFee = costs.payment_fixed_fee ?? 0;
  const revenueExVat = retailPrice / (1 + vatRate);
  const paymentCosts = retailPrice * paymentRate + paymentFixedFee;
  const returnReserve = retailPrice * (costs.return_reserve_rate ?? 0);
  const adCosts = retailPrice * (costs.ad_cost_rate ?? 0);
  const fixedCosts =
    purchasePrice +
    (costs.supplier_shipping ?? 0) +
    (costs.inbound_handling ?? 0) +
    (costs.import_duties ?? 0) +
    (costs.outbound_fulfillment ?? 0) +
    (costs.other_costs ?? 0);
  const contributionBeforeAds = revenueExVat - fixedCosts - paymentCosts - returnReserve;
  const projectedNetContribution = contributionBeforeAds - adCosts;

  return {
    complete: missing.length === 0,
    missing,
    gross_margin: retailPrice - purchasePrice,
    revenue_ex_vat: revenueExVat,
    payment_costs: paymentCosts,
    return_reserve: returnReserve,
    projected_ad_costs: adCosts,
    contribution_before_ads: contributionBeforeAds,
    projected_net_contribution: projectedNetContribution,
    break_even_roas:
      contributionBeforeAds > 0 ? retailPrice / contributionBeforeAds : null,
  };
};

export const DEFAULT_GLOBAL_COSTS: SourcingCosts = {
  vat_rate: 0.21,
  payment_rate: 0.019,
  payment_fixed_fee: 0.25,
};

export type EligibilityInput = {
  published: boolean;
  retailPrice: number;
  categoryMedian?: number | null;
  previousRetailPrice?: number | null;
  sourceCheckedAt?: Date | string | null;
  hasSourceAvailability: boolean;
  title?: string | null;
  description?: string | null;
  productType?: string | null;
  googleProductCategory?: string | null;
  hasImage: boolean;
  imageVerified: boolean;
  duplicate: boolean;
  hasCriticalMerchantIssue: boolean;
  purchasePrice?: number | null;
};

export const evaluateShoppingEligibility = (input: EligibilityInput) => {
  const failures: string[] = [];
  const checkedAt = input.sourceCheckedAt ? new Date(input.sourceCheckedAt) : null;
  const stale = !checkedAt || Date.now() - checkedAt.getTime() > 24 * 60 * 60 * 1000;

  if (!input.published) failures.push("not_published");
  if (!input.retailPrice || input.retailPrice <= 0) failures.push("invalid_price");
  if (input.retailPrice > 10_000) failures.push("retail_price_quarantine");
  if ((input.purchasePrice ?? 0) > 5_000) failures.push("purchase_price_quarantine");
  if (input.categoryMedian && input.retailPrice > input.categoryMedian * 5) {
    failures.push("category_price_outlier");
  }
  if (
    input.previousRetailPrice &&
    Math.abs(input.retailPrice - input.previousRetailPrice) / input.previousRetailPrice > 0.5
  ) {
    failures.push("price_change_reapproval");
  }
  if (stale) failures.push("source_check_stale");
  if (!input.hasSourceAvailability) failures.push("availability_unverified");
  if (!input.title?.trim()) failures.push("missing_title");
  if (!input.description?.trim()) failures.push("missing_description");
  if (!input.productType?.trim()) failures.push("missing_product_type");
  if (!input.googleProductCategory?.trim()) failures.push("missing_google_category");
  if (!input.hasImage) failures.push("missing_image");
  if (!input.imageVerified) failures.push("image_unverified");
  if (input.duplicate) failures.push("exact_duplicate");
  if (input.hasCriticalMerchantIssue) failures.push("merchant_disapproval");

  return { eligible: failures.length === 0, failures, stale };
};
