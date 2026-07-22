import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { SUPPORT_MODULE } from "../../../../../modules/support";

const STATUSES = ["open", "in_progress", "waiting_customer", "resolved", "closed"];

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const status = String((req.body as any)?.status || "");
  if (!STATUSES.includes(status)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Ongeldige casestatus.");
  }
  const support = req.scope.resolve(SUPPORT_MODULE) as any;
  const updated = await support.updateSupportCases({ id: req.params.id, status });
  res.json({ case: updated });
}
