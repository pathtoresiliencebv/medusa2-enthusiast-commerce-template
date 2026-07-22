import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { notifyCase } from "../../../../../store/support/cases/_notification";
import { SUPPORT_MODULE } from "../../../../../../modules/support";

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const support = req.scope.resolve(SUPPORT_MODULE) as any;
  const cases = await support.listSupportCases({ id: req.params.id });
  if (!cases?.[0]) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Case niet gevonden.");
  const updated = await notifyCase(req, cases[0]);
  res.json({ case: updated });
}
