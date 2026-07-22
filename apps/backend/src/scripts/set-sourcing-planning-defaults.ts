import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { CONVERSION_MODULE } from "../modules/conversion";

const OWNER_EMAIL = process.env.SOURCING_OWNER_EMAILS?.split(",")[0]?.trim() || "owner@example.com";

// Bewerkbare, conservatieve planningswaarden. Dit zijn geen leveranciersfeiten:
// een product- of categoriewaarde overschrijft deze globale terugvalwaarden.
const PLANNING_DEFAULTS = {
  vat_rate: 0.21,
  payment_rate: 0.019,
  payment_fixed_fee: 0.25,
  supplier_shipping: 10,
  inbound_handling: 2,
  import_duties: 0,
  outbound_fulfillment: 10,
  other_costs: 1,
  return_reserve_rate: 0.05,
  ad_cost_rate: 0.15,
};

export default async function setSourcingPlanningDefaults({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const service = container.resolve(CONVERSION_MODULE) as any;
  const [existing] = await service.listSourcingCostDefaults(
    { scope: "global", scope_key: "default" },
    { take: 1 },
  );
  const before = existing
    ? Object.fromEntries(
        Object.keys(PLANNING_DEFAULTS).map((key) => [key, existing[key]]),
      )
    : null;
  const payload = {
    ...PLANNING_DEFAULTS,
    scope: "global",
    scope_key: "default",
    updated_by: OWNER_EMAIL,
  };
  const saved = existing
    ? await service.updateSourcingCostDefaults({ id: existing.id, ...payload })
    : await service.createSourcingCostDefaults(payload);

  await service.createSourcingAuditLogs({
    profile_id: `cost-default:${saved.id}`,
    product_id: "scope:global:default",
    action: "set_planning_cost_defaults",
    changes: { before, after: PLANNING_DEFAULTS },
    actor_id: OWNER_EMAIL,
    actor_email: OWNER_EMAIL,
    reason:
      "Voorlopige conservatieve planningsdefaults om marges volledig te berekenen; product- en categorieoverrides blijven leidend.",
  });

  logger.info("Globale sourcing-planningsdefaults en auditregel opgeslagen.");
}
