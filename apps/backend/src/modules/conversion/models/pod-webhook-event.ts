import { model } from "@medusajs/framework/utils";

const PodWebhookEvent = model.define("pod_webhook_event", {
  id: model.id().primaryKey(),
  external_id: model.text().unique(),
  event_type: model.text(),
  payload: model.json(),
  processed: model.boolean().default(false),
  processed_at: model.dateTime().nullable(),
});

export default PodWebhookEvent;
