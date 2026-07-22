import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260715003048 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "product_merchandising" drop constraint if exists "product_merchandising_product_id_unique";`,
    );
    this.addSql(
      `alter table if exists "pod_webhook_event" drop constraint if exists "pod_webhook_event_external_id_unique";`,
    );
    this.addSql(
      `alter table if exists "pod_variant_mapping" drop constraint if exists "pod_variant_mapping_variant_id_unique";`,
    );
    this.addSql(
      `alter table if exists "conversion_bundle" drop constraint if exists "conversion_bundle_handle_unique";`,
    );
    this.addSql(
      `create table if not exists "conversion_bundle" ("id" text not null, "handle" text not null, "title" text not null, "description" text null, "hero_product_id" text not null, "items" jsonb not null, "discount_percentage" integer not null default 0, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "conversion_bundle_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_conversion_bundle_handle_unique" ON "conversion_bundle" ("handle") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_conversion_bundle_hero_product_id" ON "conversion_bundle" ("hero_product_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_conversion_bundle_deleted_at" ON "conversion_bundle" ("deleted_at") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "conversion_review" ("id" text not null, "product_id" text not null, "customer_id" text null, "order_id" text null, "author_name" text not null, "title" text null, "body" text not null, "rating" integer not null, "status" text check ("status" in ('pending', 'published', 'rejected')) not null default 'pending', "verified_purchase" boolean not null default false, "helpful_count" integer not null default 0, "media" jsonb null, "source" text not null default 'native', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "conversion_review_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_conversion_review_product_id" ON "conversion_review" ("product_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_conversion_review_customer_id" ON "conversion_review" ("customer_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_conversion_review_deleted_at" ON "conversion_review" ("deleted_at") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "pod_variant_mapping" ("id" text not null, "variant_id" text not null, "provider" text not null default 'printful', "external_variant_id" text not null, "personalization_schema" jsonb null, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pod_variant_mapping_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pod_variant_mapping_variant_id_unique" ON "pod_variant_mapping" ("variant_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pod_variant_mapping_deleted_at" ON "pod_variant_mapping" ("deleted_at") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "pod_webhook_event" ("id" text not null, "external_id" text not null, "event_type" text not null, "payload" jsonb not null, "processed" boolean not null default false, "processed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pod_webhook_event_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pod_webhook_event_external_id_unique" ON "pod_webhook_event" ("external_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pod_webhook_event_deleted_at" ON "pod_webhook_event" ("deleted_at") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "product_merchandising" ("id" text not null, "product_id" text not null, "swatches" jsonb null, "quantity_tiers" jsonb null, "delivery_label" text not null default 'Levering binnen 3-5 werkdagen', "financing_label" text null, "trust_badges" jsonb null, "recommendation_ids" jsonb null, "downsell_product_id" text null, "updated_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_merchandising_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_merchandising_product_id_unique" ON "product_merchandising" ("product_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_product_merchandising_deleted_at" ON "product_merchandising" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "conversion_bundle" cascade;`);

    this.addSql(`drop table if exists "conversion_review" cascade;`);

    this.addSql(`drop table if exists "pod_variant_mapping" cascade;`);

    this.addSql(`drop table if exists "pod_webhook_event" cascade;`);

    this.addSql(`drop table if exists "product_merchandising" cascade;`);
  }
}
