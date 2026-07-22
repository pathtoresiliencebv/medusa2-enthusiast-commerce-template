import { createHmac, timingSafeEqual } from "node:crypto";

export function createSupportSignature(secret: string, timestamp: string, body: unknown) {
  return createHmac("sha256", secret).update(`${timestamp}.${JSON.stringify(body || {})}`).digest("hex");
}

export function isValidSupportSignature(secret: string, timestamp: string, body: unknown, supplied: string) {
  const expected = createSupportSignature(secret, timestamp, body);
  return expected.length === supplied.length && timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

export function matchesOwnedOrderReference(order: { id: string; order_number: unknown }, rawReference: string) {
  const reference = rawReference.trim().toLowerCase();
  return (
    order.id.toLowerCase() === reference ||
    String(order.order_number).toLowerCase() === reference.replace(/^#/, "")
  );
}
