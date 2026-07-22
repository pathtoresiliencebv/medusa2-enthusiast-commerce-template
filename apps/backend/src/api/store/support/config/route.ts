import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { assertFeatureAccess, requireBff } from "../_utils";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  requireBff(req);
  let enabled = true;
  try {
    await assertFeatureAccess(req);
  } catch {
    enabled = false;
  }
  res.json({
    enabled,
    mode: process.env.SUPPORT_CHAT_MODE || "off",
    authenticated: Boolean(req.auth_context?.actor_id),
    limits: { messageCharacters: 2000, messagesPerTenMinutes: 20 },
  });
}
