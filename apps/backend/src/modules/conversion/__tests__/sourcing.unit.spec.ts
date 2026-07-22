import {
  calculateSourcingMargin,
  evaluateShoppingEligibility,
  resolveSourcingCosts,
} from "../utils/sourcing";

describe("sourcing costs", () => {
  it("uses product then category then global defaults", () => {
    const costs = resolveSourcingCosts(
      { purchase_price: 40, supplier_shipping: 5 },
      { supplier_shipping: 8, outbound_fulfillment: 7 },
      { vat_rate: 0.21, payment_rate: 0.019, payment_fixed_fee: 0.25 },
    );
    expect(costs.purchase_price).toBe(40);
    expect(costs.supplier_shipping).toBe(5);
    expect(costs.outbound_fulfillment).toBe(7);
    expect(costs.vat_rate).toBe(0.21);
  });

  it("never marks a net margin complete when a cost is unknown", () => {
    const margin = calculateSourcingMargin(
      100,
      resolveSourcingCosts(
        { purchase_price: 40 },
        {},
        { vat_rate: 0.21, payment_rate: 0.019, payment_fixed_fee: 0.25 },
      ),
    );
    expect(margin.complete).toBe(false);
    expect(margin.missing).toContain("supplier_shipping");
  });

  it("calculates gross, net contribution and break-even ROAS", () => {
    const margin = calculateSourcingMargin(121, {
      purchase_price: 40, supplier_shipping: 5, inbound_handling: 2,
      import_duties: 1, outbound_fulfillment: 7, other_costs: 0,
      return_reserve_rate: 0.05, ad_cost_rate: 0.1,
      vat_rate: 0.21, payment_rate: 0.019, payment_fixed_fee: 0.25,
    });
    expect(margin.complete).toBe(true);
    expect(margin.gross_margin).toBe(81);
    expect(margin.contribution_before_ads).toBeGreaterThan(0);
    expect(margin.projected_net_contribution).toBeLessThan(margin.contribution_before_ads);
    expect(margin.break_even_roas).toBeGreaterThan(1);
  });
});

describe("shopping eligibility", () => {
  const valid = {
    published: true, retailPrice: 200, categoryMedian: 180,
    sourceCheckedAt: new Date(), hasSourceAvailability: true,
    title: "Eiken bijzettafel", description: "Massief houten bijzettafel.",
    productType: "Meubels > Woonkamer > Bijzettafels", googleProductCategory: "1549",
    hasImage: true, imageVerified: true, duplicate: false,
    hasCriticalMerchantIssue: false, purchasePrice: 70,
  };

  it("allows a fully verified product", () => {
    expect(evaluateShoppingEligibility(valid).eligible).toBe(true);
  });

  it("quarantines extreme retail and purchase prices", () => {
    const result = evaluateShoppingEligibility({ ...valid, retailPrice: 417271.95, purchasePrice: 170015.3 });
    expect(result.failures).toContain("retail_price_quarantine");
    expect(result.failures).toContain("purchase_price_quarantine");
  });

  it("rejects stale checks and Merchant disapprovals", () => {
    const result = evaluateShoppingEligibility({
      ...valid,
      sourceCheckedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      hasCriticalMerchantIssue: true,
    });
    expect(result.failures).toEqual(expect.arrayContaining(["source_check_stale", "merchant_disapproval"]));
  });
});
