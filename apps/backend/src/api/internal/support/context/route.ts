import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { SUPPORT_MODULE } from "../../../../modules/support";
import { isValidSupportSignature, matchesOwnedOrderReference } from "../../../../modules/support/security";

function verifySignature(req: MedusaRequest) {
  const secret = process.env.SUPPORT_INTERNAL_SECRET;
  const timestamp = String(req.headers["x-support-timestamp"] || "");
  const supplied = String(req.headers["x-support-signature"] || "");
  const parsed = Number(timestamp);
  if (!secret || !timestamp || !supplied || !Number.isFinite(parsed) || Math.abs(Date.now() / 1000 - parsed) > 300) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Ongeldige toolaanroep.");
  }
  if (!isValidSupportSignature(secret, timestamp, req.body, supplied)) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Ongeldige toolaanroep.");
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  verifySignature(req);
  const body = (req.body || {}) as any;
  const externalConversationId = String(body.conversationId || "");
  const action = String(body.action || "");
  if (!externalConversationId || !["list_orders", "get_order"].includes(action)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Ongeldige contextaanvraag.");
  }
  const support = req.scope.resolve(SUPPORT_MODULE) as any;
  const mapped = await support.listSupportConversations({
    external_conversation_id: externalConversationId,
    status: "active",
  });
  const conversation = mapped?.[0];
  if (!conversation) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Gesprek niet gevonden.");
  if (!conversation.customer_id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "LOGIN_REQUIRED");
  }

  const query = req.scope.resolve("query") as any;
  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "created_at",
      "currency_code",
      "total",
      "payment_status",
      "fulfillment_status",
      "items.title",
      "items.quantity",
      "items.unit_price",
      "fulfillments.labels.tracking_number",
      "fulfillments.labels.tracking_url",
    ],
    filters: { customer_id: conversation.customer_id },
    pagination: { order: { created_at: "DESC" }, take: 10 },
  });
  const orders = (data || []).map(safeOrder);
  if (action === "list_orders") {
    res.json({ orders: orders.slice(0, 5) });
    return;
  }
  const reference = String(body.orderReference || "");
  const order = orders.find((item: any) => matchesOwnedOrderReference(item, reference));
  if (!order) {
    // Same response for unknown and another customer's order.
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Bestelling niet gevonden.");
  }
  res.json({ order });
}

function safeOrder(order: any) {
  const tracking = (order.fulfillments || []).flatMap((fulfillment: any) =>
    (fulfillment.labels || []).map((label: any) => ({
      number: label.tracking_number || null,
      url: label.tracking_url || null,
    })),
  );
  return {
    id: String(order.id),
    order_number: order.display_id,
    date: order.created_at,
    currency: String(order.currency_code || "eur").toUpperCase(),
    total: order.total,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    items: (order.items || []).map((item: any) => ({
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
    tracking,
  };
}
