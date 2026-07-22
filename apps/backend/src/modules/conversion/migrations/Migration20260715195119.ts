import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260715195119 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "conversion_review" add column if not exists "source_review_id" text null, add column if not exists "source_created_at" timestamptz null, add column if not exists "source_url" text null, add column if not exists "source_language" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "conversion_review" drop column if exists "source_review_id", drop column if exists "source_created_at", drop column if exists "source_url", drop column if exists "source_language";`);
  }

}
