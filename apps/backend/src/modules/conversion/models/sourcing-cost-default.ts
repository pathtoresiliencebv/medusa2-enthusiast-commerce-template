import { model } from "@medusajs/framework/utils";

const SourcingCostDefault = model.define("sourcing_cost_default", {
  id: model.id().primaryKey(),
  scope: model.enum(["global", "category"]),
  scope_key: model.text().default("default"),
  vat_rate: model.bigNumber().nullable(),
  payment_rate: model.bigNumber().nullable(),
  payment_fixed_fee: model.bigNumber().nullable(),
  supplier_shipping: model.bigNumber().nullable(),
  inbound_handling: model.bigNumber().nullable(),
  import_duties: model.bigNumber().nullable(),
  outbound_fulfillment: model.bigNumber().nullable(),
  other_costs: model.bigNumber().nullable(),
  return_reserve_rate: model.bigNumber().nullable(),
  ad_cost_rate: model.bigNumber().nullable(),
  updated_by: model.text().nullable(),
});

export default SourcingCostDefault;
