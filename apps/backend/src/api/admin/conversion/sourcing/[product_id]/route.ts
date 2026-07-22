import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { CONVERSION_MODULE } from "../../../../../modules/conversion";
import { requireSourcingOwner } from "../../_owner";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await requireSourcingOwner(req);
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const productId = req.params.product_id;
  const [profiles, audit] = await Promise.all([
    service.listSourcingProfiles({ product_id: productId }, { take: 1 }),
    service.listSourcingAuditLogs({ product_id: productId }, { order: { created_at: "DESC" }, take: 100 }),
  ]);
  res.json({ profile: profiles[0] || null, audit });
}
