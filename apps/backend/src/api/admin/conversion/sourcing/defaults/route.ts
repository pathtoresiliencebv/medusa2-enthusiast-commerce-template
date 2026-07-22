import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { CONVERSION_MODULE } from "../../../../../modules/conversion";
import { requireSourcingOwner } from "../../_owner";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await requireSourcingOwner(req);
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  res.json({ defaults: await service.listSourcingCostDefaults({}, { take: 1000 }) });
}

export async function POST(req: AuthenticatedMedusaRequest<any>, res: MedusaResponse) {
  const owner = await requireSourcingOwner(req);
  const { scope, scope_key = "default", values = {}, reason } = req.body;
  if (!reason?.trim()) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Een wijzigingsreden is verplicht.");
  if (!['global', 'category'].includes(scope)) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Ongeldige kostenscope.");
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const existing = (await service.listSourcingCostDefaults({ scope, scope_key }, { take: 1 }))[0];
  const payload = { ...values, scope, scope_key, updated_by: owner.email };
  const saved = existing
    ? await service.updateSourcingCostDefaults({ id: existing.id, ...payload })
    : await service.createSourcingCostDefaults(payload);
  await service.createSourcingAuditLogs({
    profile_id: `cost-default:${saved.id}`,
    product_id: `scope:${scope}:${scope_key}`,
    action: "update_cost_default",
    changes: payload,
    actor_id: owner.id,
    actor_email: owner.email,
    reason: reason.trim(),
  });
  res.json({ default: saved });
}
