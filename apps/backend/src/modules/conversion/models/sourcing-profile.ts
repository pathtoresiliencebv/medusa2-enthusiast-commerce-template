import { model } from "@medusajs/framework/utils";

const SourcingProfile = model.define("sourcing_profile", {
  id: model.id().primaryKey(),
  product_id: model.text().unique(),
  source_system: model.text().nullable(),
  supplier_name: model.text().nullable(),
  source_url: model.text().nullable(),
  source_sku: model.text().nullable(),
  source_product_id: model.text().nullable(),
  source_categories: model.json().nullable(),
  currency_code: model.text().default("EUR"),
  purchase_price: model.bigNumber().nullable(),
  supplier_shipping: model.bigNumber().nullable(),
  inbound_handling: model.bigNumber().nullable(),
  import_duties: model.bigNumber().nullable(),
  outbound_fulfillment: model.bigNumber().nullable(),
  other_costs: model.bigNumber().nullable(),
  return_reserve_rate: model.bigNumber().nullable(),
  ad_cost_rate: model.bigNumber().nullable(),
  warehouse_country: model.text().nullable(),
  eu_warehouse: model.boolean().default(false),
  source_availability: model.text().nullable(),
  source_checked_at: model.dateTime().nullable(),
  image_verified: model.boolean().default(false),
  internal_notes: model.text().nullable(),
  confidence: model.enum(["unknown", "low", "medium", "high"]).default("unknown"),
  risk_flags: model.json().nullable(),
  shopping_status: model
    .enum(["draft", "eligible", "awaiting_approval", "approved", "quarantined", "blocked"])
    .default("draft"),
  gate_failures: model.json().nullable(),
  owner_approved: model.boolean().default(false),
  approved_by: model.text().nullable(),
  approved_at: model.dateTime().nullable(),
  quarantine_reason: model.text().nullable(),
  override_reason: model.text().nullable(),
  public_brand: model.text().nullable(),
  public_mpn: model.text().nullable(),
  updated_by: model.text().nullable(),
});

export default SourcingProfile;
