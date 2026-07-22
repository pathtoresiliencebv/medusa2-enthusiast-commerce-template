import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260722203100 extends Migration {
  override async up(): Promise<void> {
    for (const column of [
      "purchase_price", "supplier_shipping", "inbound_handling", "import_duties",
      "outbound_fulfillment", "other_costs", "return_reserve_rate", "ad_cost_rate",
    ]) {
      this.addSql(`alter table if exists "sourcing_profile" add column if not exists "raw_${column}" jsonb null;`);
    }
    for (const column of [
      "vat_rate", "payment_rate", "payment_fixed_fee", "supplier_shipping",
      "inbound_handling", "import_duties", "outbound_fulfillment", "other_costs",
      "return_reserve_rate", "ad_cost_rate",
    ]) {
      this.addSql(`alter table if exists "sourcing_cost_default" add column if not exists "raw_${column}" jsonb null;`);
    }
  }

  override async down(): Promise<void> {
    for (const column of [
      "purchase_price", "supplier_shipping", "inbound_handling", "import_duties",
      "outbound_fulfillment", "other_costs", "return_reserve_rate", "ad_cost_rate",
    ]) {
      this.addSql(`alter table if exists "sourcing_profile" drop column if exists "raw_${column}";`);
    }
    for (const column of [
      "vat_rate", "payment_rate", "payment_fixed_fee", "supplier_shipping",
      "inbound_handling", "import_duties", "outbound_fulfillment", "other_costs",
      "return_reserve_rate", "ad_cost_rate",
    ]) {
      this.addSql(`alter table if exists "sourcing_cost_default" drop column if exists "raw_${column}";`);
    }
  }
}
