import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { SUPPORT_MODULE } from "../../../../modules/support";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const support = req.scope.resolve(SUPPORT_MODULE) as any;
  const status = req.query.status ? String(req.query.status) : undefined;
  const [cases, count] = await support.listAndCountSupportCases(
    status ? { status } : {},
    { order: { created_at: "DESC" }, take: 100 },
  );
  res.json({ cases, count });
}
