import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260722233000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "support_conversation" (
      "id" text not null,
      "external_conversation_id" text not null,
      "customer_id" text null,
      "guest_session_hash" text null,
      "status" text check ("status" in ('active', 'closed', 'expired')) not null default 'active',
      "locale" text not null default 'nl',
      "last_activity_at" timestamptz not null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "support_conversation_pkey" primary key ("id")
    );`);
    this.addSql('create unique index if not exists "IDX_support_conversation_external" on "support_conversation" ("external_conversation_id") where "deleted_at" is null;');
    this.addSql('create index if not exists "IDX_support_conversation_customer" on "support_conversation" ("customer_id") where "deleted_at" is null;');
    this.addSql('create index if not exists "IDX_support_conversation_guest" on "support_conversation" ("guest_session_hash") where "deleted_at" is null;');

    this.addSql(`create table if not exists "support_case" (
      "id" text not null,
      "type" text check ("type" in ('general', 'cancellation', 'return', 'damage', 'delivery', 'payment')) not null,
      "conversation_id" text not null,
      "customer_id" text null,
      "order_id" text null,
      "subject" text not null,
      "message" text not null,
      "transcript_snapshot" jsonb null,
      "status" text check ("status" in ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')) not null default 'open',
      "notification_status" text check ("notification_status" in ('pending', 'sent', 'failed')) not null default 'pending',
      "notification_attempts" integer not null default 0,
      "notification_last_error" text null,
      "notification_sent_at" timestamptz null,
      "idempotency_key" text not null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "support_case_pkey" primary key ("id")
    );`);
    this.addSql('create unique index if not exists "IDX_support_case_idempotency" on "support_case" ("idempotency_key") where "deleted_at" is null;');
    this.addSql('create index if not exists "IDX_support_case_conversation" on "support_case" ("conversation_id") where "deleted_at" is null;');
    this.addSql('create index if not exists "IDX_support_case_customer" on "support_case" ("customer_id") where "deleted_at" is null;');
    this.addSql('create index if not exists "IDX_support_case_order" on "support_case" ("order_id") where "deleted_at" is null;');
  }

  override async down(): Promise<void> {
    this.addSql('drop table if exists "support_case" cascade;');
    this.addSql('drop table if exists "support_conversation" cascade;');
  }
}
