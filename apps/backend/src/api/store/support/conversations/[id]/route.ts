import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import {
  assertConversationOwner,
  assertFeatureAccess,
  clientIp,
  consumeLimit,
  getEnthusiastService,
  getSupportService,
  redactForModel,
  safeConversationPayload,
} from "../../_utils";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await assertFeatureAccess(req);
  const conversation = await assertConversationOwner(req, req.params.id);
  const external = await getEnthusiastService(req).getConversation(
    Number(conversation.external_conversation_id),
  );
  res.json({
    conversation: {
      id: conversation.id,
      status: conversation.status,
      ...safeConversationPayload(external),
    },
  });
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await assertFeatureAccess(req);
  const conversation = await assertConversationOwner(req, req.params.id);
  const rawMessage = String((req.body as any)?.message || "").trim();
  if (!rawMessage || rawMessage.length > 2000) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Een bericht moet 1 tot 2.000 tekens bevatten.");
  }
  await Promise.all([
    consumeLimit(`conversation:${conversation.id}:10m`, 20, 10 * 60),
    consumeLimit(`ip:${clientIp(req)}:hour`, 60, 60 * 60),
  ]);
  const message = redactForModel(rawMessage);
  if (!message) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Het bericht bevat geen deelbare tekst.");
  }
  const enthusiast = getEnthusiastService(req);
  const task = await enthusiast.sendMessage(
    Number(conversation.external_conversation_id),
    Number(process.env.SUPPORT_ENTHUSIAST_DATASET_ID || 1),
    message,
    false,
    [],
  );
  await getSupportService(req).updateSupportConversations({
    id: conversation.id,
    last_activity_at: new Date(),
  });
  res.status(202).json({ task: { id: String(task?.task_id || task?.id || task) } });
}
