import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  assertFeatureAccess,
  clientIp,
  consumeLimit,
  getEnthusiastService,
  getOwner,
  getSupportService,
  requireBff,
  resolveSupportAgentId,
} from "../_utils";

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  requireBff(req);
  await assertFeatureAccess(req);
  await consumeLimit(`ip:${clientIp(req)}:hour`, 60, 60 * 60);
  const { customerId, guestHash } = getOwner(req);
  const locale = String((req.body as any)?.locale || "nl").slice(0, 12);
  const enthusiast = getEnthusiastService(req);
  const agentId = await resolveSupportAgentId(enthusiast);
  const externalId = await enthusiast.conversationCreate(agentId);
  const support = getSupportService(req);
  const conversation = await support.createSupportConversations({
    external_conversation_id: String(externalId),
    customer_id: customerId,
    guest_session_hash: guestHash,
    status: "active",
    locale,
    last_activity_at: new Date(),
  });
  res.status(201).json({ conversation: { id: conversation.id, status: conversation.status } });
}
