import {
  applyPercentageDiscount,
  getQuantityDiscount,
} from "../utils/pricing";

describe("conversion pricing", () => {
  const tiers = [
    { quantity: 1, discount_percentage: 0 },
    { quantity: 2, discount_percentage: 5 },
    { quantity: 4, discount_percentage: 10 },
  ];

  it.each([
    [1, 0],
    [2, 5],
    [3, 5],
    [4, 10],
    [10, 10],
  ])("selects the correct tier for quantity %i", (quantity, expected) => {
    expect(getQuantityDiscount(tiers, quantity)).toBe(expected);
  });

  it("rounds the definitive unit price in minor currency units", () => {
    expect(applyPercentageDiscount(2449, 10)).toBe(2204);
    expect(applyPercentageDiscount(2449, 5)).toBe(2327);
  });

  it("clamps invalid discounts", () => {
    expect(applyPercentageDiscount(1000, -20)).toBe(1000);
    expect(applyPercentageDiscount(1000, 120)).toBe(0);
  });
});
