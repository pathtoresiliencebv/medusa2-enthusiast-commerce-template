import { model } from "@medusajs/framework/utils";

const SupportConversation = model.define("support_conversation", {
  id: model.id().primaryKey(),
  external_conversation_id: model.text().unique(),
  customer_id: model.text().index().nullable(),
  guest_session_hash: model.text().index().nullable(),
  status: model.enum(["active", "closed", "expired"]).default("active"),
  locale: model.text().default("nl"),
  last_activity_at: model.dateTime(),
});

export default SupportConversation;
