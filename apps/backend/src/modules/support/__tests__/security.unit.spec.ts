import { createSupportSignature, isValidSupportSignature, matchesOwnedOrderReference } from "../security";

describe("support trust boundary", () => {
  test("accepts only an untampered HMAC payload", () => {
    const body = { conversationId: "42", action: "get_order", orderReference: "1001" };
    const signature = createSupportSignature("shared-secret", "123456", body);
    expect(isValidSupportSignature("shared-secret", "123456", body, signature)).toBe(true);
    expect(isValidSupportSignature("shared-secret", "123456", { ...body, conversationId: "43" }, signature)).toBe(false);
  });

  test("matches a reference only against the already customer-scoped result", () => {
    const owned = { id: "order_owned", order_number: 1001 };
    expect(matchesOwnedOrderReference(owned, "#1001")).toBe(true);
    expect(matchesOwnedOrderReference(owned, "order_other_customer")).toBe(false);
  });
});
