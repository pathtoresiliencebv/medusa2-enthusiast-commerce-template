import { model } from "@medusajs/framework/utils";

const SourcingAuditLog = model.define("sourcing_audit_log", {
  id: model.id().primaryKey(),
  profile_id: model.text().index(),
  product_id: model.text().index(),
  action: model.text(),
  changes: model.json(),
  actor_id: model.text(),
  actor_email: model.text(),
  reason: model.text().nullable(),
});

export default SourcingAuditLog;
