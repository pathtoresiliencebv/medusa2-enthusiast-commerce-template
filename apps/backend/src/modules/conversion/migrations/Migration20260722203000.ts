import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260722203000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "sourcing_profile" (
      "id" text not null, "product_id" text not null, "source_system" text null,
      "supplier_name" text null, "source_url" text null, "source_sku" text null,
      "source_product_id" text null, "source_categories" jsonb null,
      "currency_code" text not null default 'EUR', "purchase_price" numeric null,
      "supplier_shipping" numeric null, "inbound_handling" numeric null,
      "import_duties" numeric null, "outbound_fulfillment" numeric null,
      "other_costs" numeric null, "return_reserve_rate" numeric null, "ad_cost_rate" numeric null,
      "warehouse_country" text null, "eu_warehouse" boolean not null default false,
      "source_availability" text null, "source_checked_at" timestamptz null,
      "image_verified" boolean not null default false, "internal_notes" text null,
      "confidence" text check ("confidence" in ('unknown','low','medium','high')) not null default 'unknown',
      "risk_flags" jsonb null,
      "shopping_status" text check ("shopping_status" in ('draft','eligible','awaiting_approval','approved','quarantined','blocked')) not null default 'draft',
      "gate_failures" jsonb null, "owner_approved" boolean not null default false,
      "approved_by" text null, "approved_at" timestamptz null, "quarantine_reason" text null,
      "override_reason" text null, "public_brand" text null, "public_mpn" text null,
      "updated_by" text null, "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null,
      constraint "sourcing_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_sourcing_profile_product_id_unique" ON "sourcing_profile" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sourcing_profile_deleted_at" ON "sourcing_profile" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "sourcing_audit_log" (
      "id" text not null, "profile_id" text not null, "product_id" text not null,
      "action" text not null, "changes" jsonb not null, "actor_id" text not null,
      "actor_email" text not null, "reason" text null, "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null,
      constraint "sourcing_audit_log_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sourcing_audit_log_profile_id" ON "sourcing_audit_log" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sourcing_audit_log_product_id" ON "sourcing_audit_log" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sourcing_audit_log_deleted_at" ON "sourcing_audit_log" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "sourcing_cost_default" (
      "id" text not null, "scope" text check ("scope" in ('global','category')) not null,
      "scope_key" text not null default 'default', "vat_rate" numeric null,
      "payment_rate" numeric null, "payment_fixed_fee" numeric null,
      "supplier_shipping" numeric null, "inbound_handling" numeric null,
      "import_duties" numeric null, "outbound_fulfillment" numeric null,
      "other_costs" numeric null, "return_reserve_rate" numeric null, "ad_cost_rate" numeric null,
      "updated_by" text null, "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null,
      constraint "sourcing_cost_default_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_sourcing_cost_default_scope_unique" ON "sourcing_cost_default" ("scope", "scope_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sourcing_cost_default_deleted_at" ON "sourcing_cost_default" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "merchant_issue" (
      "id" text not null, "feed_item_id" text not null, "product_id" text null,
      "code" text not null, "severity" text check ("severity" in ('warning','error','disapproved')) not null,
      "title" text not null, "detail" text null, "country" text null,
      "last_seen_at" timestamptz not null, "resolved_at" timestamptz null,
      "source" text not null default 'merchant_center_csv', "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null,
      constraint "merchant_issue_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_merchant_issue_feed_item_id" ON "merchant_issue" ("feed_item_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_merchant_issue_product_id" ON "merchant_issue" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_merchant_issue_deleted_at" ON "merchant_issue" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "merchant_issue" cascade;`);
    this.addSql(`drop table if exists "sourcing_cost_default" cascade;`);
    this.addSql(`drop table if exists "sourcing_audit_log" cascade;`);
    this.addSql(`drop table if exists "sourcing_profile" cascade;`);
  }
}
