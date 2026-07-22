import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  assertConversationOwner,
  assertFeatureAccess,
  getEnthusiastService,
  safeConversationPayload,
} from "../../../../_utils";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await assertFeatureAccess(req);
  const conversation = await assertConversationOwner(req, req.params.id);
  const enthusiast = getEnthusiastService(req);
  const taskHandle = { task_id: req.params.taskId };
  const state = await enthusiast.getTaskStatus(taskHandle);
  const normalized = String(state?.state || state || "PENDING").toUpperCase();
  if (!["SUCCESS", "FAILURE", "REVOKED"].includes(normalized)) {
    res.json({ task: { id: req.params.taskId, state: normalized.toLowerCase() } });
    return;
  }
  if (normalized !== "SUCCESS") {
    res.status(502).json({
      task: { id: req.params.taskId, state: "failed" },
      error: "De assistent kon niet antwoorden. Je kunt direct een medewerker inschakelen.",
    });
    return;
  }
  await enthusiast.fetchResponseMessage(Number(conversation.external_conversation_id), taskHandle);
  const external = await enthusiast.getConversation(Number(conversation.external_conversation_id));
  res.json({
    task: { id: req.params.taskId, state: "success" },
    ...safeConversationPayload(external),
  });
}
