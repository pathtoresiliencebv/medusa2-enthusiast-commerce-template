import { model } from "@medusajs/framework/utils";

const SupportCase = model.define("support_case", {
  id: model.id().primaryKey(),
  type: model.enum(["general", "cancellation", "return", "damage", "delivery", "payment"]),
  conversation_id: model.text().index(),
  customer_id: model.text().index().nullable(),
  order_id: model.text().index().nullable(),
  subject: model.text(),
  message: model.text(),
  transcript_snapshot: model.json().nullable(),
  status: model.enum(["open", "in_progress", "waiting_customer", "resolved", "closed"]).default("open"),
  notification_status: model.enum(["pending", "sent", "failed"]).default("pending"),
  notification_attempts: model.number().default(0),
  notification_last_error: model.text().nullable(),
  notification_sent_at: model.dateTime().nullable(),
  idempotency_key: model.text().unique(),
});

export default SupportCase;
