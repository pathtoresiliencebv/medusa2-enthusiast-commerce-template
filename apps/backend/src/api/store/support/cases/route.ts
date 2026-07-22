import { createHash } from "node:crypto";

import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import {
  assertConversationOwner,
  assertFeatureAccess,
  consumeLimit,
  getEnthusiastService,
  getOwner,
  getSupportService,
  redactForModel,
  safeConversationPayload,
} from "../_utils";
import { notifyCase } from "./_notification";

const CASE_TYPES = ["general", "cancellation", "return", "damage", "delivery", "payment"];

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await assertFeatureAccess(req);
  const body = (req.body || {}) as any;
  const type = String(body.type || "");
  const conversationId = String(body.conversationId || "");
  const subject = String(body.subject || "").trim().slice(0, 160);
  const message = String(body.message || "").trim();
  const suppliedKey = String(req.headers["idempotency-key"] || body.idempotencyKey || "");
  if (!CASE_TYPES.includes(type) || !conversationId || !subject || !message || message.length > 2000 || suppliedKey.length < 16) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "De supportaanvraag is onvolledig of ongeldig.");
  }
  const conversation = await assertConversationOwner(req, conversationId);
  const { customerId, guestHash } = getOwner(req);
  const ownerKey = customerId || guestHash!;
  const idempotencyKey = createHash("sha256").update(`${ownerKey}:${suppliedKey}`).digest("hex");
  const support = getSupportService(req);
  const existing = await support.listSupportCases({ idempotency_key: idempotencyKey });
  if (existing?.[0]) {
    res.json({ case: publicCase(existing[0]) });
    return;
  }
  await consumeLimit(`case:${ownerKey}:day`, 3, 24 * 60 * 60);

  let order: any = null;
  const requestedOrderId = body.orderId ? String(body.orderId) : null;
  if (requestedOrderId) {
    if (!customerId) {
      throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Log in om een bestelling te selecteren.");
    }
    const query = req.scope.resolve("query") as any;
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "display_id"],
      filters: { id: requestedOrderId, customer_id: customerId },
    });
    order = data?.[0];
    if (!order) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Bestelling niet gevonden.");
  }

  let transcript: unknown = [];
  try {
    const external = await getEnthusiastService(req).getConversation(Number(conversation.external_conversation_id));
    transcript = safeConversationPayload(external).messages;
  } catch {
    transcript = [];
  }
  let created: any;
  try {
    created = await support.createSupportCases({
      type,
      conversation_id: conversation.id,
      customer_id: customerId,
      order_id: order?.id || null,
      subject,
      message: redactForModel(message),
      transcript_snapshot: transcript,
      status: "open",
      notification_status: "pending",
      notification_attempts: 0,
      idempotency_key: idempotencyKey,
    });
  } catch (error) {
    const raced = await support.listSupportCases({ idempotency_key: idempotencyKey });
    if (raced?.[0]) {
      res.json({ case: publicCase(raced[0]) });
      return;
    }
    throw error;
  }
  const notified = await notifyCase(req, created);
  res.status(201).json({ case: publicCase(notified) });
}

function publicCase(input: any) {
  return {
    id: input.id,
    type: input.type,
    status: input.status,
    notification_status: input.notification_status,
    created_at: input.created_at,
  };
}
